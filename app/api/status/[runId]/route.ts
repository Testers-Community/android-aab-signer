/**
 * GET /api/status/[runId]
 *
 * Check the status of a signing workflow run.
 *
 * Returns:
 * - status: 'queued' | 'in_progress' | 'completed' | 'failed'
 * - conclusion: 'success' | 'failure' | 'cancelled' | null
 * - artifactUrl: Download URL (only when completed successfully)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowRun, getArtifactDownloadUrl } from '@/lib/github';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const runIdNum = parseInt(runId, 10);

    if (isNaN(runIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid run ID' },
        { status: 400 }
      );
    }

    // Get workflow run status
    const run = await getWorkflowRun(runIdNum);

    // Build response based on status
    const response: {
      success: boolean;
      status: string;
      conclusion: string | null;
      artifactUrl?: string;
      error?: string;
    } = {
      success: true,
      status: run.status,
      conclusion: run.conclusion,
    };

    // If completed, check conclusion and get artifact URL
    if (run.status === 'completed') {
      if (run.conclusion === 'success') {
        // Get artifact download URL
        const artifactUrl = await getArtifactDownloadUrl(runIdNum);
        if (artifactUrl) {
          // Return our API endpoint for downloading (handles auth)
          response.artifactUrl = `/api/download/${runIdNum}`;
        }
      } else if (run.conclusion === 'failure') {
        response.error = 'Signing failed. Please check your keystore credentials.';
      } else if (run.conclusion === 'cancelled') {
        response.error = 'Signing was cancelled.';
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Status check error:', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check status',
      },
      { status: 500 }
    );
  }
}
