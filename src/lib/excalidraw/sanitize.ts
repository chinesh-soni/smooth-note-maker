/**
 * Sanitizes elements for Excalidraw native dark theme:
 * In Excalidraw dark theme, the canvas has an invert(93%) filter.
 * Stroke #1e1e1e renders as crisp white ink.
 * If an element was previously saved with #ffffff, it inverts to black,
 * so we convert it to #1e1e1e so it renders in bright white ink.
 */
export function sanitizeElementsForDarkTheme(elements: readonly any[]): any[] {
  return (elements || []).map((el: any) => {
    if (!el) return el;
    const stroke = (el.strokeColor || '').toLowerCase().trim();
    if (stroke === '#ffffff' || stroke === '#fff' || stroke === 'rgb(255, 255, 255)' || !stroke) {
      return { ...el, strokeColor: '#1e1e1e' };
    }
    return el;
  });
}

// Backwards-compatible alias
export const sanitizeDarkStrokesToWhite = sanitizeElementsForDarkTheme;
