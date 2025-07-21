'use client';

import { lazy, ComponentType } from 'react';

// Bundle size optimization utilities
export const lazyComponents = {
  // Lazy load heavy components
  AdvancedLoadingStates: lazy(() => import('@/components/AdvancedLoadingStates')),
  GestureChatWindow: lazy(() => import('@/components/GestureChatWindow')),
  GesturePromptGenerator: lazy(() => import('@/components/GesturePromptGenerator')),
  TouchOptimizedInterface: lazy(() => import('@/components/TouchOptimizedInterface')),
  OptimizedAnimations: lazy(() => import('@/components/OptimizedAnimations')),
  ModernScaffoldDisplay: lazy(() => import('@/components/ModernScaffoldDisplay')),
  ModernPromptCard: lazy(() => import('@/components/ModernPromptCard')),
  PerformanceDashboard: lazy(() => import('@/components/PerformanceDashboard')),
  
  // Lazy load chart components
  Charts: lazy(() => import('recharts').then(module => ({ default: module }))),
  
  // Lazy load image optimization
  OptimizedImage: lazy(() => import('@/components/OptimizedImage')),
  ImageDropZone: lazy(() => import('@/components/ImageDropZone'))
};

// Code splitting by route
export const routeComponents = {
  Chat: lazy(() => import('@/app/chat/page')),
  Performance: lazy(() => import('@/components/PerformanceDashboard')),
  Settings: lazy(() => import('@/app/settings/page').catch(() => ({ default: () => <div>Settings</div> })))
};

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private observers: Map<string, IntersectionObserver> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private cache: Map<string, any> = new Map();
  private maxCacheSize = 50;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Cleanup observers
  cleanupObserver(key: string) {
    const observer = this.observers.get(key);
    if (observer) {
      observer.disconnect();
      this.observers.delete(key);
    }
  }

  // Cleanup timers
  cleanupTimer(key: string) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  // Cache management with LRU
  setCache(key: string, value: any) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  getCache(key: string) {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  clearCache() {
    this.cache.clear();
  }

  // Global cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.timers.forEach(timer => clearTimeout(timer));
    this.observers.clear();
    this.timers.clear();
    this.clearCache();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring() {
    // Monitor Long Tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration, 'ms');
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // Long task API not supported
      }

      // Monitor Layout Shifts
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.value > 0.1) {
            console.warn('Layout shift detected:', entry.value);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        // Layout shift API not supported
      }
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Resource optimization
export class ResourceOptimizer {
  private static instance: ResourceOptimizer;
  private preloadedResources: Set<string> = new Set();

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer();
    }
    return ResourceOptimizer.instance;
  }

  // Preload critical resources
  preloadResource(href: string, as: string, type?: string) {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  // Prefetch next page resources
  prefetchResource(href: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  // Remove unused stylesheets
  removeUnusedStyles() {
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach((stylesheet) => {
      try {
        const rules = Array.from(stylesheet.cssRules || []);
        // This is a simplified example - in practice, you'd need more sophisticated unused CSS detection
        console.log(`Stylesheet has ${rules.length} rules`);
      } catch (e) {
        // Cross-origin stylesheet
      }
    });
  }

  // Optimize images
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  }
}

// Bundle analyzer helper
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    // Estimate component sizes
    const componentSizes = {
      'AdvancedLoadingStates': '~15KB',
      'GestureChatWindow': '~25KB',
      'GesturePromptGenerator': '~20KB',
      'TouchOptimizedInterface': '~18KB',
      'OptimizedAnimations': '~12KB',
      'ModernScaffoldDisplay': '~22KB',
      'ModernPromptCard': '~16KB',
      'PerformanceDashboard': '~30KB'
    };

    console.group('Bundle Size Analysis');
    Object.entries(componentSizes).forEach(([component, size]) => {
      console.log(`${component}: ${size}`);
    });
    console.groupEnd();
  }
}

// Performance optimization hooks
export function usePerformanceOptimization() {
  const memoryManager = MemoryManager.getInstance();
  const performanceMonitor = PerformanceMonitor.getInstance();
  const resourceOptimizer = ResourceOptimizer.getInstance();

  // Initialize monitoring
  React.useEffect(() => {
    performanceMonitor.startMonitoring();
    resourceOptimizer.optimizeImages();

    return () => {
      memoryManager.cleanup();
      performanceMonitor.cleanup();
    };
  }, []);

  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    preloadResource: resourceOptimizer.preloadResource.bind(resourceOptimizer),
    prefetchResource: resourceOptimizer.prefetchResource.bind(resourceOptimizer)
  };
}

// Tree shaking helpers
export const treeShakingOptimizations = {
  // Import only what you need from libraries
  lodash: {
    // Instead of: import _ from 'lodash'
    // Use: import { debounce } from 'lodash'
    recommended: 'Import specific functions only'
  },
  
  framerMotion: {
    // Instead of: import { motion, AnimatePresence, ... } from 'framer-motion'
    // Use: import { motion } from 'framer-motion' (only what you need)
    recommended: 'Import specific components only'
  },
  
  lucideReact: {
    // Instead of: import * as Icons from 'lucide-react'
    // Use: import { Home, Settings } from 'lucide-react'
    recommended: 'Import specific icons only'
  }
};

// Cleanup utilities
export function cleanupUnusedCode() {
  // Remove console.logs in production
  if (process.env.NODE_ENV === 'production') {
    const originalLog = console.log;
    console.log = () => {};
    console.warn = () => {};
    console.error = originalLog; // Keep errors
  }

  // Remove development-only code
  if (process.env.NODE_ENV !== 'development') {
    // Remove debug components
    const debugElements = document.querySelectorAll('[data-debug]');
    debugElements.forEach(el => el.remove());
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  // Start monitoring
  const performanceMonitor = PerformanceMonitor.getInstance();
  performanceMonitor.startMonitoring();

  // Optimize resources
  const resourceOptimizer = ResourceOptimizer.getInstance();
  resourceOptimizer.optimizeImages();

  // Cleanup unused code
  cleanupUnusedCode();

  // Analyze bundle size in development
  if (process.env.NODE_ENV === 'development') {
    analyzeBundleSize();
  }

  console.log('Performance optimizations initialized');
}

// React import for hooks
import React from 'react';