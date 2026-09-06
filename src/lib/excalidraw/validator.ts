import { Note, StoredExcalidrawFile } from '@/types/note';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: {
    elements: any[];
    appState: Record<string, any>;
    files: Record<string, any>;
    metadata?: Record<string, any>;
  };
}

/**
 * Validates whether an unknown parsed object is a valid Excalidraw / Smooth Note Maker note.
 */
export function validateExcalidrawFile(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid file: File must be a JSON object' };
  }

  const obj = data as Record<string, any>;

  // Check if it's an excalidraw file format
  const isExcalidraw = obj.type === 'excalidraw' || Array.isArray(obj.elements);
  if (!isExcalidraw && !Array.isArray(obj.elements)) {
    return {
      isValid: false,
      error: 'Invalid file format: Missing elements array or excalidraw type',
    };
  }

  const elements = Array.isArray(obj.elements) ? obj.elements : [];
  const appState = obj.appState && typeof obj.appState === 'object' ? obj.appState : {};
  const files = obj.files && typeof obj.files === 'object' ? obj.files : {};
  const metadata = obj.metadata && typeof obj.metadata === 'object' ? obj.metadata : {};

  // Sanitize elements: filter out nulls or invalid objects
  const sanitizedElements = elements.filter(
    (el) => el && typeof el === 'object' && typeof el.type === 'string'
  );

  return {
    isValid: true,
    sanitizedData: {
      elements: sanitizedElements,
      appState: {
        ...appState,
        collaborators: undefined, // Strip ephemeral collaboration state
      },
      files,
      metadata,
    },
  };
}

/**
 * Parses raw JSON string and safely validates the content.
 */
export function parseAndValidateExcalidrawJson(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return validateExcalidrawFile(parsed);
  } catch (err: any) {
    return {
      isValid: false,
      error: `JSON parse error: ${err?.message || 'Invalid JSON syntax'}`,
    };
  }
}
