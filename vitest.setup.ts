import '@testing-library/jest-dom';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;
if (typeof window !== 'undefined') {
  window.ResizeObserver = ResizeObserver;
}
