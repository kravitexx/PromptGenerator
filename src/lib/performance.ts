/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Array<(metric: PerformanceMetrics) => void> = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring performance for a named operation
   */
  start(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
  }

  /**
   * End measuring performance for a named operation
   */
  end(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    this.metrics.delete(name);
    return metric;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * Add observer for performance metrics
   */
  addObserver(observer: (metric: PerformanceMetrics) => void): void {
    this.observers.push(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (metric: PerformanceMetrics) => void): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Get all completed metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  const startMeasure = (name: string, metadata?: Record<string, any>) => {
    monitor.start(name, metadata);
  };

  const endMeasure = (name: string) => {
    return monitor.end(name);
  };

  const measureAsync = async <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return monitor.measure(name, fn, metadata);
  };

  return {
    startMeasure,
    endMeasure,
    measureAsync,
    monitor
  };
}

/**
 * Bundle size analyzer
 */
export class BundleAnalyzer {
  private static loadTimes: Map<string, number> = new Map();

  static recordModuleLoad(moduleName: string, loadTime: number): void {
    this.loadTimes.set(moduleName, loadTime);
  }

  static getLoadTimes(): Record<string, number> {
    return Object.fromEntries(this.loadTimes);
  }

  static getLargestModules(limit: number = 10): Array<{ name: string; time: number }> {
    return Array.from(this.loadTimes.entries())
      .map(([name, time]) => ({ name, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  private static measurements: Array<{
    timestamp: number;
    used: number;
    total: number;
  }> = [];

  static measure(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.measurements.push({
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      });

      // Keep only last 100 measurements
      if (this.measurements.length > 100) {
        this.measurements.shift();
      }
    }
  }

  static getMeasurements() {
    return this.measurements;
  }

  static getCurrentUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  }

  static startMonitoring(interval: number = 5000): () => void {
    const intervalId = setInterval(() => {
      this.measure();
    }, interval);

    return () => clearInterval(intervalId);
  }
}

/**
 * Network performance monitoring
 */
export class NetworkMonitor {
  private static requests: Map<string, {
    url: string;
    method: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    size?: number;
    status?: number;
  }> = new Map();

  static startRequest(id: string, url: string, method: string): void {
    this.requests.set(id, {
      url,
      method,
      startTime: performance.now()
    });
  }

  static endRequest(
    id: string, 
    status: number, 
    size?: number
  ): void {
    const request = this.requests.get(id);
    if (request) {
      request.endTime = performance.now();
      request.duration = request.endTime - request.startTime;
      request.status = status;
      request.size = size;

      // Log slow requests
      if (request.duration > 3000) {
        console.warn(`Slow network request: ${request.method} ${request.url} took ${request.duration.toFixed(2)}ms`);
      }
    }
  }

  static getRequests() {
    return Array.from(this.requests.values()).filter(r => r.duration !== undefined);
  }

  static getAverageResponseTime(): number {
    const completedRequests = this.getRequests();
    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, req) => sum + (req.duration || 0), 0);
    return totalTime / completedRequests.length;
  }

  static clear(): void {
    this.requests.clear();
  }
}

/**
 * Core Web Vitals monitoring
 */
export class WebVitalsMonitor {
  private static vitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  } = {};

  static init(): void {
    // First Contentful Paint
    this.observePerformanceEntry('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.vitals.FCP = entry.startTime;
      }
    });

    // Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.vitals.LCP = entry.startTime;
    });

    // First Input Delay
    this.observePerformanceEntry('first-input', (entry) => {
      this.vitals.FID = entry.processingStart - entry.startTime;
    });

    // Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.vitals.CLS = (this.vitals.CLS || 0) + entry.value;
      }
    });

    // Time to First Byte
    this.observePerformanceEntry('navigation', (entry) => {
      this.vitals.TTFB = entry.responseStart - entry.requestStart;
    });
  }

  private static observePerformanceEntry(
    type: string,
    callback: (entry: any) => void
  ): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(callback);
        });
        observer.observe({ type, buffered: true });
      } catch (error) {
        console.warn(`Failed to observe ${type}:`, error);
      }
    }
  }

  static getVitals() {
    return { ...this.vitals };
  }

  static reportVitals(): void {
    const vitals = this.getVitals();
    console.log('Core Web Vitals:', vitals);

    // Report to analytics service if available
    if (typeof gtag !== 'undefined') {
      Object.entries(vitals).forEach(([name, value]) => {
        if (value !== undefined) {
          gtag('event', name, {
            event_category: 'Web Vitals',
            value: Math.round(value),
            non_interaction: true,
          });
        }
      });
    }
  }
}

/**
 * Performance optimization recommendations
 */
export class PerformanceOptimizer {
  static analyzeAndRecommend(): string[] {
    const recommendations: string[] = [];
    const vitals = WebVitalsMonitor.getVitals();
    const memory = MemoryMonitor.getCurrentUsage();
    const avgResponseTime = NetworkMonitor.getAverageResponseTime();

    // Check Core Web Vitals
    if (vitals.FCP && vitals.FCP > 1800) {
      recommendations.push('First Contentful Paint is slow. Consider optimizing critical resources.');
    }

    if (vitals.LCP && vitals.LCP > 2500) {
      recommendations.push('Largest Contentful Paint is slow. Optimize images and critical path.');
    }

    if (vitals.FID && vitals.FID > 100) {
      recommendations.push('First Input Delay is high. Reduce JavaScript execution time.');
    }

    if (vitals.CLS && vitals.CLS > 0.1) {
      recommendations.push('Cumulative Layout Shift is high. Ensure proper image dimensions.');
    }

    // Check memory usage
    if (memory && memory.percentage > 80) {
      recommendations.push('High memory usage detected. Consider implementing memory cleanup.');
    }

    // Check network performance
    if (avgResponseTime > 2000) {
      recommendations.push('Average response time is slow. Consider API optimization or caching.');
    }

    return recommendations;
  }
}

// Initialize Web Vitals monitoring
if (typeof window !== 'undefined') {
  WebVitalsMonitor.init();
  
  // Start memory monitoring
  MemoryMonitor.startMonitoring();
  
  // Report vitals on page unload
  window.addEventListener('beforeunload', () => {
    WebVitalsMonitor.reportVitals();
  });
}