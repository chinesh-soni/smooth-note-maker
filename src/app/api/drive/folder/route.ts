import { NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getOrCreateAppFolder } from '@/lib/drive/folder';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuthSession();
    const folder = await getOrCreateAppFolder(session.accessToken as string);
    return NextResponse.json(folder);
  } catch (error: any) {
    console.error('Error in /api/drive/folder:', error);
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to get/create app folder' },
      { status }
    );
  }
}
