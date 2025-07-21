'use client';

// Cross-browser testing utilities
export interface TestResult {
  feature: string;
  supported: boolean;
  fallbackUsed: boolean;
  performance: number;
  errors: string[];
}

export interface BrowserTestSuite {
  name: string;
  tests: TestResult[];
  overallScore: number;
  recommendations: string[];
}

// Feature testing functions
export class CrossBrowserTester {
  private results: TestResult[] = [];

  // Test CSS features
  testCSSFeatures(): TestResult[] {
    const cssTests = [
      { feature: 'CSS Grid', property: 'display', value: 'grid' },
      { feature: 'Flexbox', property: 'display', value: 'flex' },
      { feature: 'Custom Properties', property: '--test', value: 'value' },
      { feature: 'Backdrop Filter', property: 'backdrop-filter', value: 'blur(10px)' },
      { feature: 'Clip Path', property: 'clip-path', value: 'circle(50%)' },
      { feature: 'Transform 3D', property: 'transform', value: 'translateZ(0)' },
      { feature: 'Transition', property: 'transition', value: 'all 0.3s ease' },
      { feature: 'Animation', property: 'animation', value: 'test 1s ease' }
    ];

    return cssTests.map(test => {
      const supported = CSS.supports(test.property, test.value);
      return {
        feature: test.feature,
        supported,
        fallbackUsed: !supported,
        performance: supported ? 100 : 50,
        errors: supported ? [] : [`${test.feature} not supported`]
      };
    });
  }

  // Test JavaScript APIs
  testJavaScriptAPIs(): TestResult[] {
    const apiTests = [
      { feature: 'Intersection Observer', test: () => 'IntersectionObserver' in window },
      { feature: 'Resize Observer', test: () => 'ResizeObserver' in window },
      { feature: 'Web Animations API', test: () => 'animate' in document.createElement('div') },
      { feature: 'Request Animation Frame', test: () => 'requestAnimationFrame' in window },
      { feature: 'Touch Events', test: () => 'ontouchstart' in window },
      { feature: 'Pointer Events', test: () => 'onpointerdown' in window },
      { feature: 'Vibration API', test: () => 'vibrate' in navigator },
      { feature: 'Web Share API', test: () => 'share' in navigator },
      { feature: 'Service Worker', test: () => 'serviceWorker' in navigator },
      { feature: 'Local Storage', test: () => 'localStorage' in window },
      { feature: 'Session Storage', test: () => 'sessionStorage' in window },
      { feature: 'IndexedDB', test: () => 'indexedDB' in window }
    ];

    return apiTests.map(test => {
      let supported = false;
      let errors: string[] = [];

      try {
        supported = test.test();
      } catch (error) {
        errors.push(`Error testing ${test.feature}: ${error}`);
      }

      return {
        feature: test.feature,
        supported,
        fallbackUsed: !supported,
        performance: supported ? 100 : 0,
        errors
      };
    });
  }

  // Test image format support
  testImageFormats(): Promise<TestResult[]> {
    const formats = [
      { name: 'WebP', mimeType: 'image/webp' },
      { name: 'AVIF', mimeType: 'image/avif' },
      { name: 'JPEG XL', mimeType: 'image/jxl' }
    ];

    return Promise.all(
      formats.map(format => 
        new Promise<TestResult>((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          
          try {
            const dataURL = canvas.toDataURL(format.mimeType);
            const supported = dataURL.indexOf(`data:${format.mimeType}`) === 0;
            
            resolve({
              feature: `${format.name} Support`,
              supported,
              fallbackUsed: !supported,
              performance: supported ? 100 : 75,
              errors: []
            });
          } catch (error) {
            resolve({
              feature: `${format.name} Support`,
              supported: false,
              fallbackUsed: true,
              performance: 75,
              errors: [`Error testing ${format.name}: ${error}`]
            });
          }
        })
      )
    );
  }

  // Test animation performance
  async testAnimationPerformance(): Promise<TestResult> {
    return new Promise((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();
      let lastFrameTime = startTime;
      let totalFrameTime = 0;

      const testElement = document.createElement('div');
      testElement.style.cssText = `
        position: fixed;
        top: -100px;
        left: -100px;
        width: 50px;
        height: 50px;
        background: red;
        transition: transform 0.1s ease;
      `;
      document.body.appendChild(testElement);

      const animate = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        totalFrameTime += frameTime;
        lastFrameTime = currentTime;
        frameCount++;

        testElement.style.transform = `translateX(${Math.sin(currentTime * 0.01) * 10}px)`;

        if (currentTime - startTime < 1000) {
          requestAnimationFrame(animate);
        } else {
          document.body.removeChild(testElement);
          
          const avgFrameTime = totalFrameTime / frameCount;
          const fps = 1000 / avgFrameTime;
          const performance = Math.min(100, (fps / 60) * 100);

          resolve({
            feature: 'Animation Performance',
            supported: fps > 30,
            fallbackUsed: fps < 45,
            performance: Math.round(performance),
            errors: fps < 30 ? ['Low animation performance detected'] : []
          });
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Test memory usage
  testMemoryUsage(): TestResult {
    let memoryInfo = null;
    let errors: string[] = [];

    try {
      // @ts-ignore - performance.memory is not in all browsers
      memoryInfo = performance.memory;
    } catch (error) {
      errors.push('Memory API not available');
    }

    if (memoryInfo) {
      const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
      const totalMB = memoryInfo.totalJSHeapSize / 1024 / 1024;
      const usage = (usedMB / totalMB) * 100;

      return {
        feature: 'Memory Usage',
        supported: true,
        fallbackUsed: false,
        performance: Math.max(0, 100 - usage),
        errors: usage > 80 ? ['High memory usage detected'] : []
      };
    }

    return {
      feature: 'Memory Usage',
      supported: false,
      fallbackUsed: true,
      performance: 50,
      errors
    };
  }

  // Run all tests
  async runAllTests(): Promise<BrowserTestSuite> {
    const cssResults = this.testCSSFeatures();
    const jsResults = this.testJavaScriptAPIs();
    const imageResults = await this.testImageFormats();
    const animationResult = await this.testAnimationPerformance();
    const memoryResult = this.testMemoryUsage();

    const allResults = [
      ...cssResults,
      ...jsResults,
      ...imageResults,
      animationResult,
      memoryResult
    ];

    const overallScore = allResults.reduce((sum, result) => sum + result.performance, 0) / allResults.length;
    
    const recommendations = this.generateRecommendations(allResults);

    return {
      name: 'Cross-Browser Compatibility Test',
      tests: allResults,
      overallScore: Math.round(overallScore),
      recommendations
    };
  }

  // Generate recommendations based on test results
  private generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => !r.supported);
    const lowPerformanceTests = results.filter(r => r.performance < 70);

    if (failedTests.length > 0) {
      recommendations.push('Consider updating your browser for better feature support');
    }

    if (lowPerformanceTests.length > 0) {
      recommendations.push('Some animations may be reduced for better performance');
    }

    const memoryTest = results.find(r => r.feature === 'Memory Usage');
    if (memoryTest && memoryTest.performance < 50) {
      recommendations.push('High memory usage detected - consider closing other tabs');
    }

    const animationTest = results.find(r => r.feature === 'Animation Performance');
    if (animationTest && animationTest.performance < 70) {
      recommendations.push('Animation performance is low - effects may be simplified');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your browser is fully compatible with all features');
    }

    return recommendations;
  }
}

// Automated testing runner
export class AutomatedTester {
  private tester = new CrossBrowserTester();
  private results: BrowserTestSuite | null = null;

  async runTests(): Promise<BrowserTestSuite> {
    console.log('Running cross-browser compatibility tests...');
    
    try {
      this.results = await this.tester.runAllTests();
      
      // Log results in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Test Results:', this.results);
        this.logDetailedResults();
      }
      
      // Store results for debugging
      sessionStorage.setItem('browserTestResults', JSON.stringify(this.results));
      
      return this.results;
    } catch (error) {
      console.error('Error running browser tests:', error);
      throw error;
    }
  }

  private logDetailedResults(): void {
    if (!this.results) return;

    console.group('🧪 Cross-Browser Test Results');
    console.log(`Overall Score: ${this.results.overallScore}/100`);
    
    console.group('📊 Feature Support');
    this.results.tests.forEach(test => {
      const icon = test.supported ? '✅' : '❌';
      const performance = test.performance;
      console.log(`${icon} ${test.feature}: ${performance}% (${test.supported ? 'Supported' : 'Not Supported'})`);
      
      if (test.errors.length > 0) {
        console.warn('  Errors:', test.errors);
      }
    });
    console.groupEnd();

    if (this.results.recommendations.length > 0) {
      console.group('💡 Recommendations');
      this.results.recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  getResults(): BrowserTestSuite | null {
    return this.results;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: any[] = [];
  private observer: PerformanceObserver | null = null;

  start(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.push(...entries);
      });

      this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getMetrics(): any[] {
    return this.metrics;
  }

  generateReport(): any {
    const paintMetrics = this.metrics.filter(m => m.entryType === 'paint');
    const navigationMetrics = this.metrics.filter(m => m.entryType === 'navigation');

    return {
      firstPaint: paintMetrics.find(m => m.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintMetrics.find(m => m.name === 'first-contentful-paint')?.startTime || 0,
      domContentLoaded: navigationMetrics[0]?.domContentLoadedEventEnd || 0,
      loadComplete: navigationMetrics[0]?.loadEventEnd || 0,
      totalMetrics: this.metrics.length
    };
  }
}

// Export singleton instances
export const crossBrowserTester = new CrossBrowserTester();
export const automatedTester = new AutomatedTester();
export const performanceMonitor = new PerformanceMonitor();