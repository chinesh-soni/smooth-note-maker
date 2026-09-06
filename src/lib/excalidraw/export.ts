import { Note } from '@/types/note';
import { serializeNoteToExcalidrawJson } from './serializer';
import { parseAndValidateExcalidrawJson } from './validator';

/**
 * Downloads the given note as a .excalidraw JSON file.
 */
export function downloadExcalidrawFile(note: Note): void {
  const json = serializeNoteToExcalidrawJson(note);
  const blob = new Blob([json], { type: 'application/vnd.excalidraw+json' });
  const url = URL.createObjectURL(blob);
  const safeTitle = (note.title || 'Untitled Note').replace(/[/\\?%*:|"<>]/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeTitle}.excalidraw`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads and parses an uploaded .excalidraw or .json file.
 */
export async function readExcalidrawFromFile(file: File): Promise<any> {
  const text = await file.text();
  const result = parseAndValidateExcalidrawJson(text);
  if (!result.isValid || !result.sanitizedData) {
    throw new Error(result.error || 'Invalid Excalidraw file format');
  }
  return result.sanitizedData;
}
