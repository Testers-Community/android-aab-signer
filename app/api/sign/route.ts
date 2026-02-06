/**
 * POST /api/sign
 *
 * Trigger the GitHub Actions signing workflow.
 *
 * SECURITY:
 * - Passwords are passed directly to GitHub API, never logged
 * - No storage of credentials
 * - Workflow masks passwords in logs using ::add-mask::
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSigningParams } from '@/lib/validation';

export const runtime = 'nodejs';

const GITHUB_API_BASE = 'https://api.github.com';

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    throw new Error('Missing required environment variables');
  }

  return { token, owner, repo };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      aabUrl,
      keystoreUrl,
      aabFileName,
      keystoreFileName,
      keystorePassword,
      keyAlias,
      keyPassword
    } = body;

    // Validate URLs
    if (!aabUrl || !keystoreUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing file URLs' },
        { status: 400 }
      );
    }

    // Validate signing parameters
    const validation = validateSigningParams({
      keystorePassword,
      keyAlias,
      keyPassword,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { token, owner, repo } = getConfig();

    // Trigger the signing workflow with blob URLs
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/sign.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            aab_url: aabUrl,
            keystore_url: keystoreUrl,
            aab_filename: aabFileName || 'app.aab',
            keystore_filename: keystoreFileName || 'keystore.jks',
            keystore_password: keystorePassword,
            key_alias: keyAlias,
            key_password: keyPassword,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Workflow trigger failed:', error);
      throw new Error('Failed to trigger signing workflow');
    }

    // Wait for workflow to be created
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find the workflow run
    const runsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/sign.yml/runs?per_page=5`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
        },
      }
    );

    let runId = null;
    if (runsResponse.ok) {
      const runsData = await runsResponse.json();
      const recentRun = runsData.workflow_runs?.find((run: { created_at: string }) => {
        const createdAt = new Date(run.created_at);
        const now = new Date();
        return (now.getTime() - createdAt.getTime()) < 60000; // Within last minute
      });
      runId = recentRun?.id || null;
    }

    return NextResponse.json({
      success: true,
      message: 'Signing workflow triggered',
      runId: runId,
    });
  } catch (error) {
    console.error('Sign error:', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger signing',
      },
      { status: 500 }
    );
  }
}
