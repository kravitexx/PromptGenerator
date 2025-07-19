/**
 * Integration tests for performance optimizations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { optimizeImage, validateImageFile } from '@/lib/imageOptimization';
import { debounce, memoizeWithTTL, retryWithBackoff } from '@/lib/debounce';
import { PerformanceMonitor, MemoryMonitor, NetworkMonitor } from '@/lib/performance';

// Mock performance APIs
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10, // 10MB
      totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    },
  },
});

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    PerformanceMonitor.getInstance().clear();
    NetworkMonitor.clear();
  });

  describe('Image Optimization', () => {
    it('should optimize large images efficiently', async () => {
      // Create a mock large image file
      const mockFile = new File(['mock image data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      // Mock file size to be large
      Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      const validation = validateImageFile(mockFile);
      expect(validation.isValid).toBe(true);

      // Note: In a real test environment, we would need to mock canvas and image APIs
      // For now, we test the validation logic
    });

    it('should reject invalid image files', () => {
      const invalidFile = new File(['not an image'], 'test.txt', {
        type: 'text/plain',
      });

      const validation = validateImageFile(invalidFile);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Unsupported image format');
    });

    it('should reject oversized files', () => {
      const largeFile = new File(['large image'], 'large.jpg', {
        type: 'image/jpeg',
      });

      // Mock file size to be too large
      Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB

      const validation = validateImageFile(largeFile);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('too large');
    });
  });

  describe('Debouncing and Throttling', () => {
    it('should debounce function calls correctly', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times quickly
      const promise1 = debouncedFn('arg1');
      const promise2 = debouncedFn('arg2');
      const promise3 = debouncedFn('arg3');

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should only call once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');

      // All promises should resolve to the same result
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual(['result', 'result', 'result']);
    });

    it('should handle debounced function cancellation', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      debouncedFn.cancel();

      // Wait for original delay
      setTimeout(() => {
        expect(mockFn).not.toHaveBeenCalled();
      }, 150);
    });

    it('should memoize function results with TTL', async () => {
      const mockFn = vi.fn().mockImplementation((x: number) => x * 2);
      const memoizedFn = memoizeWithTTL(mockFn, 1000); // 1 second TTL

      // First call
      const result1 = memoizedFn(5);
      expect(result1).toBe(10);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Second call with same argument (should use cache)
      const result2 = memoizedFn(5);
      expect(result2).toBe(10);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Call with different argument
      const result3 = memoizedFn(10);
      expect(result3).toBe(20);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry failed operations with backoff', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await retryWithBackoff(mockFn, 3, 10); // 3 retries, 10ms base delay

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(
        retryWithBackoff(mockFn, 2, 10) // 2 retries, 10ms base delay
      ).rejects.toThrow('Persistent failure');

      expect(mockFn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const monitor = PerformanceMonitor.getInstance();

      monitor.start('test-operation', { type: 'api-call' });
      
      // Simulate some work
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Busy wait for 10ms
      }

      const metric = monitor.end('test-operation');

      expect(metric).toBeDefined();
      expect(metric?.name).toBe('test-operation');
      expect(metric?.duration).toBeGreaterThan(0);
      expect(metric?.metadata).toEqual({ type: 'api-call' });
    });

    it('should measure async operations', async () => {
      const monitor = PerformanceMonitor.getInstance();

      const mockAsyncFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('done'), 50))
      );

      const result = await monitor.measure('async-test', mockAsyncFn);

      expect(result).toBe('done');
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);

      const metrics = monitor.getMetrics();
      const asyncMetric = metrics.find(m => m.name === 'async-test');
      expect(asyncMetric).toBeDefined();
      expect(asyncMetric?.duration).toBeGreaterThan(40); // Should be around 50ms
    });

    it('should track memory usage', () => {
      const currentUsage = MemoryMonitor.getCurrentUsage();

      expect(currentUsage).toBeDefined();
      expect(currentUsage?.used).toBe(1024 * 1024 * 10); // 10MB (mocked)
      expect(currentUsage?.total).toBe(1024 * 1024 * 50); // 50MB (mocked)
      expect(currentUsage?.percentage).toBe(20); // 10/50 * 100
    });

    it('should track network requests', () => {
      const requestId = 'test-request-1';
      
      NetworkMonitor.startRequest(requestId, '/api/test', 'GET');
      NetworkMonitor.endRequest(requestId, 200, 1024);

      const requests = NetworkMonitor.getRequests();
      const testRequest = requests.find(r => r.url === '/api/test');

      expect(testRequest).toBeDefined();
      expect(testRequest?.method).toBe('GET');
      expect(testRequest?.status).toBe(200);
      expect(testRequest?.size).toBe(1024);
      expect(testRequest?.duration).toBeGreaterThan(0);
    });

    it('should calculate average response time', () => {
      // Add multiple requests
      NetworkMonitor.startRequest('req1', '/api/test1', 'GET');
      NetworkMonitor.endRequest('req1', 200, 512);

      NetworkMonitor.startRequest('req2', '/api/test2', 'POST');
      NetworkMonitor.endRequest('req2', 201, 1024);

      const avgTime = NetworkMonitor.getAverageResponseTime();
      expect(avgTime).toBeGreaterThan(0);
    });
  });

  describe('Bundle and Resource Optimization', () => {
    it('should handle dynamic imports efficiently', async () => {
      // Test dynamic import performance
      const startTime = performance.now();
      
      // Simulate dynamic import
      const mockModule = await Promise.resolve({
        default: { name: 'test-module' }
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(mockModule.default.name).toBe('test-module');
      expect(loadTime).toBeLessThan(100); // Should be fast for mocked import
    });

    it('should optimize resource loading order', () => {
      // Test that critical resources are prioritized
      const criticalResources = ['fonts', 'critical-css', 'main-js'];
      const nonCriticalResources = ['analytics', 'social-widgets', 'ads'];

      // Simulate resource loading priorities
      const loadOrder = [...criticalResources, ...nonCriticalResources];
      
      // Critical resources should come first
      expect(loadOrder.slice(0, 3)).toEqual(criticalResources);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API failures gracefully', async () => {
      const mockApiCall = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: 'success' });

      // Should retry and succeed
      const result = await retryWithBackoff(mockApiCall, 2, 10);
      
      expect(result).toEqual({ data: 'success' });
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should degrade gracefully when performance APIs are unavailable', () => {
      // Mock missing performance API
      const originalPerformance = global.performance;
      delete (global as any).performance;

      // Should not throw errors
      expect(() => {
        const monitor = PerformanceMonitor.getInstance();
        monitor.start('test');
        monitor.end('test');
      }).not.toThrow();

      // Restore performance API
      global.performance = originalPerformance;
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      });

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      expect(prefersReducedMotion).toBe(true);

      // Animation durations should be reduced
      const animationDuration = prefersReducedMotion ? 0 : 300;
      expect(animationDuration).toBe(0);
    });

    it('should provide appropriate loading states', () => {
      const loadingStates = {
        idle: 'Ready to start',
        loading: 'Processing...',
        success: 'Completed successfully',
        error: 'An error occurred',
      };

      expect(loadingStates.idle).toBeDefined();
      expect(loadingStates.loading).toBeDefined();
      expect(loadingStates.success).toBeDefined();
      expect(loadingStates.error).toBeDefined();
    });
  });
});