import { driveRequest, driveMultipartUpload } from './client';
import { DriveFile, DriveFileListResponse } from '@/types/drive';
import { Note } from '@/types/note';
import { serializeNoteToExcalidrawJson, deserializeExcalidrawJsonToNote, APP_VERSION } from '@/lib/excalidraw/serializer';

export const EXCALIDRAW_MIME_TYPE = 'application/vnd.excalidraw+json';
export const JSON_MIME_TYPE = 'application/json';

/**
 * Lists all .excalidraw notes in the specified Google Drive folder.
 */
export async function listNotesFromDrive(
  accessToken: string,
  folderId: string
): Promise<DriveFile[]> {
  const query = `'${folderId}' in parents and trashed = false`;
  const fields = 'files(id,name,mimeType,modifiedTime,createdTime,description,appProperties,size)';
  const url = `/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc&pageSize=100`;

  const response = await driveRequest<DriveFileListResponse>(url, accessToken);
  return response.files || [];
}

/**
 * Downloads a note's content and metadata from Google Drive.
 */
export async function getNoteFromDrive(
  accessToken: string,
  fileId: string
): Promise<{ note: Note; driveFile: DriveFile }> {
  // 1. Get file metadata
  const metaUrl = `/files/${fileId}?fields=id,name,mimeType,modifiedTime,createdTime,appProperties,description`;
  const driveFile = await driveRequest<DriveFile>(metaUrl, accessToken);

  // 2. Get file content
  const contentUrl = `/files/${fileId}?alt=media`;
  const rawContent = await driveRequest<string>(contentUrl, accessToken);

  const parsedNote = deserializeExcalidrawJsonToNote(
    typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent),
    {
      driveFileId: fileId,
      title: driveFile.name.replace(/\.excalidraw$/, ''),
      remoteModifiedTime: driveFile.modifiedTime,
    }
  );

  return { note: parsedNote, driveFile };
}

/**
 * Creates a new note in Google Drive folder using multipart upload.
 */
export async function createNoteInDrive(
  accessToken: string,
  folderId: string,
  note: Note
): Promise<DriveFile> {
  const fileName = `${note.title || 'Untitled Note'}.excalidraw`;
  const jsonContent = serializeNoteToExcalidrawJson(note);

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: JSON_MIME_TYPE,
    description: `Smooth Note Maker note: ${note.title}`,
    appProperties: {
      app: 'Smooth Note Maker',
      version: APP_VERSION,
      noteId: note.id,
      lastEdited: new Date(note.updatedAt).toISOString(),
    },
  };

  const response = await driveMultipartUpload<DriveFile>(
    '/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,createdTime,appProperties',
    accessToken,
    metadata,
    jsonContent,
    JSON_MIME_TYPE,
    'POST'
  );

  return response;
}

/**
 * Updates an existing note file in Google Drive.
 */
export async function updateNoteInDrive(
  accessToken: string,
  fileId: string,
  note: Note
): Promise<DriveFile> {
  const fileName = `${note.title || 'Untitled Note'}.excalidraw`;
  const jsonContent = serializeNoteToExcalidrawJson(note);

  const metadata = {
    name: fileName,
    description: `Smooth Note Maker note: ${note.title}`,
    appProperties: {
      app: 'Smooth Note Maker',
      version: APP_VERSION,
      noteId: note.id,
      lastEdited: new Date(note.updatedAt).toISOString(),
    },
  };

  const response = await driveMultipartUpload<DriveFile>(
    `/files/${fileId}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,createdTime,appProperties`,
    accessToken,
    metadata,
    jsonContent,
    JSON_MIME_TYPE,
    'PATCH'
  );

  return response;
}

/**
 * Renames a note in Google Drive.
 */
export async function renameNoteInDrive(
  accessToken: string,
  fileId: string,
  newTitle: string
): Promise<DriveFile> {
  const fileName = `${newTitle}.excalidraw`;
  const metadata = {
    name: fileName,
    description: `Smooth Note Maker note: ${newTitle}`,
  };

  return await driveRequest<DriveFile>(
    `/files/${fileId}?fields=id,name,modifiedTime`,
    accessToken,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    }
  );
}

/**
 * Deletes a note from Google Drive.
 */
export async function deleteNoteFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  await driveRequest<void>(`/files/${fileId}`, accessToken, {
    method: 'DELETE',
  });
}
