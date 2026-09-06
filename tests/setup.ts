import '@testing-library/jest-dom';

// Polyfill for indexedDB in test environment if needed
if (typeof window !== 'undefined' && !window.indexedDB) {
  // Simple mock or global polyfill
}
