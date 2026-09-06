/**
 * Generates a unique note ID or sync item ID.
 * Uses crypto.randomUUID if available, with a reliable fallback.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'snm_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}
