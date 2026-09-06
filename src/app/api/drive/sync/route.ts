import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import {
  createNoteInDrive,
  updateNoteInDrive,
  deleteNoteFromDrive,
  renameNoteInDrive,
} from '@/lib/drive/operations';
import { getOrCreateAppFolder } from '@/lib/drive/folder';
import { SyncQueueItem } from '@/types/sync';
import { Note } from '@/types/note';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await request.json();
    const { items } = body as { items: SyncQueueItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const folder = await getOrCreateAppFolder(session.accessToken as string);
    const results: Array<{ id: string; success: boolean; driveFileId?: string; error?: string }> = [];

    for (const item of items) {
      try {
        if (item.action === 'CREATE') {
          const file = await createNoteInDrive(
            session.accessToken as string,
            folder.folderId,
            item.payload as Note
          );
          results.push({ id: item.id, success: true, driveFileId: file.id });
        } else if (item.action === 'UPDATE') {
          if (item.payload.driveFileId) {
            const file = await updateNoteInDrive(
              session.accessToken as string,
              item.payload.driveFileId,
              item.payload as Note
            );
            results.push({ id: item.id, success: true, driveFileId: file.id });
          } else {
            // Note wasn't created in Drive yet
            const file = await createNoteInDrive(
              session.accessToken as string,
              folder.folderId,
              item.payload as Note
            );
            results.push({ id: item.id, success: true, driveFileId: file.id });
          }
        } else if (item.action === 'RENAME') {
          if (item.payload.driveFileId && item.payload.title) {
            const file = await renameNoteInDrive(
              session.accessToken as string,
              item.payload.driveFileId,
              item.payload.title
            );
            results.push({ id: item.id, success: true, driveFileId: file.id });
          } else {
            results.push({ id: item.id, success: true });
          }
        } else if (item.action === 'DELETE') {
          if (item.payload.driveFileId) {
            await deleteNoteFromDrive(session.accessToken as string, item.payload.driveFileId);
          }
          results.push({ id: item.id, success: true });
        }
      } catch (err: any) {
        console.error(`Sync error for item ${item.id}:`, err);
        results.push({
          id: item.id,
          success: false,
          error: err.message || 'Sync operation failed',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error in batch sync:', error);
    const isAuthError =
      error.status === 401 ||
      error.status === 403 ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('insufficient authentication scopes');
    const status = isAuthError ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to process sync queue' },
      { status }
    );
  }
}
