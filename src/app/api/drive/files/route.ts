import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { listNotesFromDrive, createNoteInDrive } from '@/lib/drive/operations';
import { getOrCreateAppFolder } from '@/lib/drive/folder';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const searchParams = request.nextUrl.searchParams;
    let folderId = searchParams.get('folderId');

    if (!folderId) {
      const folder = await getOrCreateAppFolder(session.accessToken as string);
      folderId = folder.folderId;
    }

    const files = await listNotesFromDrive(session.accessToken as string, folderId);
    return NextResponse.json({ files, folderId });
  } catch (error: any) {
    console.error('Error listing files from Drive:', error);
    const isAuthError =
      error.status === 401 ||
      error.status === 403 ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('insufficient authentication scopes');
    const status = isAuthError ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to list notes from Google Drive' },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await request.json();
    const { note, folderId: requestedFolderId } = body;

    if (!note) {
      return NextResponse.json({ error: 'Missing note payload' }, { status: 400 });
    }

    let folderId = requestedFolderId;
    if (!folderId) {
      const folder = await getOrCreateAppFolder(session.accessToken as string);
      folderId = folder.folderId;
    }

    const createdDriveFile = await createNoteInDrive(
      session.accessToken as string,
      folderId,
      note
    );

    return NextResponse.json({ file: createdDriveFile });
  } catch (error: any) {
    console.error('Error creating note in Drive:', error);
    const isAuthError =
      error.status === 401 ||
      error.status === 403 ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('insufficient authentication scopes');
    const status = isAuthError ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create note in Google Drive' },
      { status }
    );
  }
}
