/**
 * POST /api/blob-upload
 *
 * Handles client-side uploads to Vercel Blob.
 * Supports large files (up to 500MB on Pro plan).
 */

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file types
        const ext = pathname.split('.').pop()?.toLowerCase();
        const validExtensions = ['aab', 'jks', 'keystore', 'p12', 'pfx'];

        if (!ext || !validExtensions.includes(ext)) {
          throw new Error('Invalid file type');
        }

        // Allow any content type - browsers detect various MIME types for these files
        return {
          maximumSizeInBytes: 150 * 1024 * 1024, // 150MB max
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // File uploaded successfully
        console.log('Blob upload completed:', blob.pathname);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
