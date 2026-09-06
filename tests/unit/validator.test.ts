import { describe, it, expect } from 'vitest';
import { validateExcalidrawFile, parseAndValidateExcalidrawJson } from '@/lib/excalidraw/validator';

describe('Excalidraw Validator', () => {
  it('should validate a valid Excalidraw JSON structure', () => {
    const validData = {
      type: 'excalidraw',
      version: 2,
      source: 'https://smooth-note-maker.vercel.app',
      elements: [
        { id: '1', type: 'rectangle', x: 10, y: 10, width: 100, height: 100 },
      ],
      appState: { viewBackgroundColor: '#ffffff' },
      files: {},
    };

    const result = validateExcalidrawFile(validData);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData?.elements.length).toBe(1);
  });

  it('should sanitize null or corrupted elements in array', () => {
    const dataWithCorruptedElements = {
      type: 'excalidraw',
      elements: [
        { id: '1', type: 'rectangle', x: 10, y: 10 },
        null,
        undefined,
        { invalid: true }, // missing type
        { id: '2', type: 'ellipse', x: 20, y: 20 },
      ],
    };

    const result = validateExcalidrawFile(dataWithCorruptedElements);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData?.elements.length).toBe(2);
    expect(result.sanitizedData?.elements[0].type).toBe('rectangle');
    expect(result.sanitizedData?.elements[1].type).toBe('ellipse');
  });

  it('should reject non-object payloads', () => {
    expect(validateExcalidrawFile(null).isValid).toBe(false);
    expect(validateExcalidrawFile('string').isValid).toBe(false);
    expect(validateExcalidrawFile(123).isValid).toBe(false);
  });

  it('should parse and validate JSON strings safely without throwing', () => {
    const validJsonStr = JSON.stringify({
      type: 'excalidraw',
      elements: [{ id: 'el1', type: 'line' }],
    });

    const successRes = parseAndValidateExcalidrawJson(validJsonStr);
    expect(successRes.isValid).toBe(true);

    const invalidJsonStr = '{ corrupted json string ... ';
    const failRes = parseAndValidateExcalidrawJson(invalidJsonStr);
    expect(failRes.isValid).toBe(false);
    expect(failRes.error).toContain('JSON parse error');
  });
});
