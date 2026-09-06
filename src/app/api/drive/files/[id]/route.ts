import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import {
  getNoteFromDrive,
  updateNoteInDrive,
  deleteNoteFromDrive,
  renameNoteInDrive,
} from '@/lib/drive/operations';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession();
    const fileId = params.id;

    const { note, driveFile } = await getNoteFromDrive(
      session.accessToken as string,
      fileId
    );

    return NextResponse.json({ note, driveFile });
  } catch (error: any) {
    console.error(`Error fetching file ${params.id}:`, error);
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch note from Google Drive' },
      { status }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession();
    const fileId = params.id;
    const body = await request.json();
    const { note, expectedModifiedTime, force } = body;

    if (!note) {
      return NextResponse.json({ error: 'Missing note payload' }, { status: 400 });
    }

    // Conflict detection: If expectedModifiedTime is provided and force is not true, verify
    if (expectedModifiedTime && !force) {
      try {
        const { driveFile } = await getNoteFromDrive(session.accessToken as string, fileId);
        const remoteTime = new Date(driveFile.modifiedTime).getTime();
        const expectedTime = new Date(expectedModifiedTime).getTime();

        if (remoteTime > expectedTime + 2000) {
          // Remote was updated more than 2s after expected base version
          return NextResponse.json(
            {
              conflict: true,
              remoteModifiedTime: driveFile.modifiedTime,
              message: 'Conflict detected: note was modified elsewhere.',
            },
            { status: 409 }
          );
        }
      } catch (err) {
        // If conflict check fails non-fatally, continue
        console.warn('Conflict check warning:', err);
      }
    }

    const updatedDriveFile = await updateNoteInDrive(
      session.accessToken as string,
      fileId,
      note
    );

    return NextResponse.json({ file: updatedDriveFile });
  } catch (error: any) {
    console.error(`Error updating file ${params.id}:`, error);
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update note in Google Drive' },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession();
    const fileId = params.id;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const updatedDriveFile = await renameNoteInDrive(
      session.accessToken as string,
      fileId,
      title
    );

    return NextResponse.json({ file: updatedDriveFile });
  } catch (error: any) {
    console.error(`Error renaming file ${params.id}:`, error);
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to rename note in Google Drive' },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession();
    const fileId = params.id;

    await deleteNoteFromDrive(session.accessToken as string, fileId);

    return NextResponse.json({ success: true, fileId });
  } catch (error: any) {
    console.error(`Error deleting file ${params.id}:`, error);
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete note from Google Drive' },
      { status }
    );
  }
}
