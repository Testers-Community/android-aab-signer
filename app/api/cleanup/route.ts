/**
 * POST /api/cleanup
 *
 * Delete blob files after signing is complete.
 */

import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URLs' },
        { status: 400 }
      );
    }

    // Delete all blob files
    await del(urls);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
