/**
 * Sanitizes strokes for OneNote blackboard dark theme:
 * Converts any black/dark pen strokes to crisp white ink.
 */
export function sanitizeDarkStrokesToWhite(elements: readonly any[]): any[] {
  return (elements || []).map((el: any) => {
    if (!el) return el;
    const stroke = (el.strokeColor || '').toLowerCase().trim();
    const isDark =
      !stroke ||
      [
        '#000000',
        '#000',
        '#1e1e1e',
        '#121212',
        '#181818',
        '#2d3748',
        '#333333',
        '#333',
        '#0f172a',
        '#111111',
        '#111',
        'rgb(0, 0, 0)',
        'rgba(0, 0, 0, 1)',
      ].includes(stroke);

    return isDark ? { ...el, strokeColor: '#ffffff' } : el;
  });
}
