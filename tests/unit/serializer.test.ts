import { describe, it, expect } from 'vitest';
import {
  serializeNoteToExcalidrawJson,
  deserializeExcalidrawJsonToNote,
  APP_VERSION,
} from '@/lib/excalidraw/serializer';
import { Note } from '@/types/note';

describe('Excalidraw Serializer', () => {
  const sampleNote: Note = {
    id: 'test_note_123',
    title: 'My Project Architecture',
    createdAt: 1700000000000,
    updatedAt: 1700000050000,
    lastSyncedAt: 1700000050000,
    driveFileId: 'drive_file_abc',
    version: 2,
    tags: ['design', 'architecture'],
    elements: [
      { id: 'el1', type: 'rectangle', x: 50, y: 50, width: 200, height: 100 },
    ],
    appState: {
      viewBackgroundColor: '#faf5ff',
      theme: 'light',
    },
    files: {},
  };

  it('should serialize Note into valid Excalidraw JSON string with full metadata', () => {
    const jsonStr = serializeNoteToExcalidrawJson(sampleNote);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.type).toBe('excalidraw');
    expect(parsed.version).toBe(2);
    expect(parsed.metadata.id).toBe('test_note_123');
    expect(parsed.metadata.title).toBe('My Project Architecture');
    expect(parsed.metadata.appVersion).toBe(APP_VERSION);
    expect(parsed.elements.length).toBe(1);
    expect(parsed.appState.viewBackgroundColor).toBe('#faf5ff');
  });

  it('should deserialize Excalidraw JSON string back into Note model', () => {
    const jsonStr = serializeNoteToExcalidrawJson(sampleNote);
    const restoredNote = deserializeExcalidrawJsonToNote(jsonStr, {
      driveFileId: 'drive_file_abc',
    });

    expect(restoredNote.id).toBe('test_note_123');
    expect(restoredNote.title).toBe('My Project Architecture');
    expect(restoredNote.driveFileId).toBe('drive_file_abc');
    expect(restoredNote.elements.length).toBe(1);
    expect(restoredNote.appState.viewBackgroundColor).toBe('#faf5ff');
  });
});
