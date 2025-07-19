import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver which is not available in JSDOM
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: 0,
  };
};

Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() });

// Mock ResizeObserver which is not available in JSDOM
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock fetch
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});