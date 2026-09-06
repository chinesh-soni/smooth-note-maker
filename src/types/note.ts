export type TemplateType = 'blank' | 'lined' | 'grid' | 'meeting' | 'brainstorm';

export interface ExcalidrawSceneData {
  elements: readonly any[];
  appState?: Record<string, any>;
  files?: Record<string, any>;
}

export interface NoteMetadata {
  id: string;
  title: string;
  driveFileId?: string | null;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number | null;
  version: number;
  remoteModifiedTime?: string | null;
  tags?: string[];
  isPinned?: boolean;
  elementCount?: number;
  previewSvg?: string;
}

export interface Note extends NoteMetadata {
  elements: readonly any[];
  appState: Record<string, any>;
  files: Record<string, any>;
}

export interface StoredExcalidrawFile {
  type: 'excalidraw';
  version: number;
  source: string;
  elements: readonly any[];
  appState: Record<string, any>;
  files: Record<string, any>;
  metadata: {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    appVersion: string;
    version: number;
  };
}
