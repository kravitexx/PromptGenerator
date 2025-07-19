import { describe, it, expect, vi } from 'vitest';
import { 
  cn,
  fileToBase64,
  base64ToBlob,
  debounce,
  throttle,
  formatDate,
  truncateText,
  generateId,
  copyToClipboard,
  downloadAsFile,
  isValidEmail,
  formatFileSize,
  isBrowser,
  safeJsonParse,
  sleep
} from '@/lib/utils';

// Mock DOM APIs for testing
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

Object.assign(document, {
  createElement: vi.fn(() => ({
    value: '',
    select: vi.fn(),
    click: vi.fn(),
    remove: vi.fn(),
    style: {},
    href: '',
    download: ''
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  execCommand: vi.fn(() => true),
});

global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
} as any;

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });

    it('should handle Tailwind class conflicts', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2'); // Later class should override
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('', null, undefined)).toBe('');
    });
  });

  describe('File Utilities', () => {
    it('should convert file to base64', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: 'data:text/plain;base64,dGVzdCBjb250ZW50',
        onload: null as any,
        onerror: null as any,
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      
      const promise = fileToBase64(mockFile);
      
      // Simulate successful read
      mockFileReader.onload();
      
      const result = await promise;
      expect(result).toBe('dGVzdCBjb250ZW50');
    });

    it('should handle file read errors', async () => {
      const mockFile = new File(['test'], 'test.txt');
      
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any,
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      
      const promise = fileToBase64(mockFile);
      
      // Simulate error
      mockFileReader.onerror(new Error('Read failed'));
      
      await expect(promise).rejects.toThrow();
    });

    it('should convert base64 to blob URL', () => {
      const base64 = 'dGVzdCBjb250ZW50';
      const result = base64ToBlob(base64, 'text/plain');
      
      expect(result).toBe('blob:mock-url');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('Function Utilities', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      // Wait for debounce delay
      await sleep(150);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle function calls', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      // First call should execute immediately
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Subsequent calls should be throttled
      throttledFn();
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Wait for throttle period
      await sleep(150);
      
      // Now should be able to call again
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('String Utilities', () => {
    it('should truncate text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('He...');
      expect(truncateText('Hello', 10)).toBe('Hello');
      expect(truncateText('Hello World', 11)).toBe('Hello World');
    });

    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Browser Utilities', () => {
    it('should detect browser environment', () => {
      // In test environment, window is defined by jsdom
      expect(isBrowser()).toBe(true);
    });

    it('should copy text to clipboard', async () => {
      const text = 'Test text to copy';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should handle clipboard API failures gracefully', async () => {
      // Mock clipboard API failure
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard failed'));
      
      const result = await copyToClipboard('test');
      
      // Should fall back to execCommand
      expect(result).toBe(true);
      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should download files', () => {
      const content = 'File content';
      const filename = 'test.txt';
      
      downloadAsFile(content, filename, 'text/plain');
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('JSON Utilities', () => {
    it('should safely parse valid JSON', () => {
      const validJson = '{"key": "value"}';
      const fallback = { default: true };
      
      const result = safeJsonParse(validJson, fallback);
      
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const invalidJson = '{"invalid": json}';
      const fallback = { default: true };
      
      const result = safeJsonParse(invalidJson, fallback);
      
      expect(result).toEqual(fallback);
    });

    it('should handle empty strings', () => {
      const fallback = { default: true };
      const result = safeJsonParse('', fallback);
      
      expect(result).toEqual(fallback);
    });
  });

  describe('Async Utilities', () => {
    it('should create delays with sleep function', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });

    it('should handle zero delay', async () => {
      const start = Date.now();
      await sleep(0);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(50); // Should be very quick
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(cn(null as any, undefined as any, 'valid')).toBe('valid');
      expect(truncateText(null as any, 5)).toBe('');
      expect(formatFileSize(null as any)).toBe('0 Bytes');
      expect(isValidEmail(null as any)).toBe(false);
    });

    it('should handle very large numbers', () => {
      const largeSize = 1024 * 1024 * 1024 * 1024; // 1TB
      const formatted = formatFileSize(largeSize);
      expect(formatted).toContain('GB'); // Should handle gracefully
    });

    it('should handle special characters in text operations', () => {
      const specialText = 'Hello 🌟 World! @#$%^&*()';
      expect(truncateText(specialText, 10)).toBe('Hello 🌟...');
      expect(generateId()).not.toContain('🌟'); // IDs should be safe
    });

    it('should handle concurrent debounced calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);
      
      // Start multiple concurrent sequences
      const promises = Array.from({ length: 5 }, async (_, i) => {
        debouncedFn();
        await sleep(10);
        debouncedFn();
      });
      
      await Promise.all(promises);
      await sleep(100); // Wait for debounce
      
      // Should only execute once despite multiple calls
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle throttled calls with different arguments', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 50);
      
      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');
      
      // First call should execute with first argument
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');
      
      await sleep(100);
      
      throttledFn('arg4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('arg4');
    });
  });
});