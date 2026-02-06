/**
 * GET /api/download/[runId]
 *
 * Download the signed AAB artifact from a completed workflow run.
 *
 * This endpoint handles GitHub authentication and streams the artifact
 * directly to the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowRun, getArtifactDownloadUrl, downloadArtifact } from '@/lib/github';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for download

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

    // Verify workflow completed successfully
    const run = await getWorkflowRun(runIdNum);

    if (run.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Workflow not yet completed' },
        { status: 400 }
      );
    }

    if (run.conclusion !== 'success') {
      return NextResponse.json(
        { success: false, error: 'Workflow did not complete successfully' },
        { status: 400 }
      );
    }

    // Get artifact URL
    const artifactUrl = await getArtifactDownloadUrl(runIdNum);

    if (!artifactUrl) {
      return NextResponse.json(
        { success: false, error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Download artifact (returns a zip file)
    const artifactBuffer = await downloadArtifact(artifactUrl);

    // Return the zip file (convert Buffer to Uint8Array for Response compatibility)
    return new NextResponse(new Uint8Array(artifactBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="signed-aab-${runIdNum}.zip"`,
        'Content-Length': artifactBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error instanceof Error ? error.message : 'Unknown error');

    const errorMessage = error instanceof Error ? error.message : 'Failed to download artifact';
    const isExpired = errorMessage.includes('expired') || errorMessage.includes('no longer available');

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        expired: isExpired,
      },
      { status: isExpired ? 410 : 500 } // 410 Gone for expired artifacts
    );
  }
}
