import { driveRequest } from './client';
import { DriveFolderResponse, DriveFileListResponse } from '@/types/drive';

export const APP_FOLDER_NAME = 'Smooth Note Maker Notes';

/**
 * Finds or creates the dedicated visible app folder in the user's Google Drive.
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<DriveFolderResponse> {
  // 1. Search for an existing active folder
  const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${APP_FOLDER_NAME}' and trashed = false`;
  const listUrl = `/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=1`;

  const searchResult = await driveRequest<DriveFileListResponse>(listUrl, accessToken);

  if (searchResult.files && searchResult.files.length > 0) {
    return {
      folderId: searchResult.files[0].id,
      name: APP_FOLDER_NAME,
      isNew: false,
    };
  }

  // 2. If folder does not exist, create it
  const createFolderData = {
    name: APP_FOLDER_NAME,
    mimeType: 'application/vnd.google-apps.folder',
    description: 'Folder for Smooth Note Maker handwritten drawings and notes',
  };

  const createResult = await driveRequest<{ id: string; name: string }>(
    '/files?fields=id,name',
    accessToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createFolderData),
    }
  );

  return {
    folderId: createResult.id,
    name: APP_FOLDER_NAME,
    isNew: true,
  };
}
