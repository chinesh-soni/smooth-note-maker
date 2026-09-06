export interface DriveAppProperties {
  app?: string;
  version?: string;
  noteId?: string;
  lastEdited?: string;
  clientVersion?: string;
  [key: string]: string | undefined;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  createdTime: string;
  trashed?: boolean;
  size?: string;
  description?: string;
  appProperties?: DriveAppProperties;
}

export interface DriveFileListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface DriveFolderResponse {
  folderId: string;
  name: string;
  isNew: boolean;
}
