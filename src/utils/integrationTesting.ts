'use client';

// Integration testing utilities for UI modernization
export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
}

export interface IntegrationTestSuite {
  suiteName: string;
  results: IntegrationTestResult[];
  overallPassed: boolean;
  totalDuration: number;
  passRate: number;
}

// Test API integrations with modern UI
export class APIIntegrationTester {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  async testGeminiIntegration(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test if Gemini API endpoint is accessible
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      if (!response.ok) {
        errors.push(`Gemini API returned ${response.status}: ${response.statusText}`);
      }

      // Test prompt generation
      const promptResponse = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'Test prompt generation',
          model: 'gemini-pro'
        })
      });

      if (!promptResponse.ok) {
        errors.push(`Prompt generation failed: ${promptResponse.statusText}`);
      }

    } catch (error) {
      errors.push(`API integration error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Gemini API Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }

  async testClerkIntegration(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test if Clerk is properly initialized
      if (typeof window !== 'undefined') {
        const clerkLoaded = document.querySelector('[data-clerk-loaded]');
        if (!clerkLoaded) {
          warnings.push('Clerk may not be fully loaded');
        }

        // Test authentication state
        const authState = sessionStorage.getItem('clerk-auth-state');
        if (!authState) {
          warnings.push('No authentication state found');
        }
      }

    } catch (error) {
      errors.push(`Clerk integration error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Clerk Authentication Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }

  async testDrivePersistence(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test localStorage availability
      if (typeof window !== 'undefined') {
        const testKey = 'integration-test-key';
        const testValue = 'integration-test-value';
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        
        if (retrieved !== testValue) {
          errors.push('localStorage persistence test failed');
        }
        
        localStorage.removeItem(testKey);

        // Test IndexedDB if available
        if ('indexedDB' in window) {
          // Basic IndexedDB availability test
          const request = indexedDB.open('test-db', 1);
          request.onerror = () => {
            warnings.push('IndexedDB may not be available');
          };
        } else {
          warnings.push('IndexedDB not supported');
        }
      }

    } catch (error) {
      errors.push(`Drive persistence error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Drive Persistence Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }
}

// Test UI component integrations
export class UIIntegrationTester {
  async testModernComponentsIntegration(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test if modern components are properly loaded
      const modernComponents = [
        'ModernChatInput',
        'ModernMessageBubble',
        'ModernPromptCard',
        'ModernScaffoldDisplay',
        'FloatingApiKeyManager'
      ];

      for (const component of modernComponents) {
        const elements = document.querySelectorAll(`[data-component="${component}"]`);
        if (elements.length === 0) {
          warnings.push(`${component} not found in DOM`);
        }
      }

      // Test animation system
      const animatedElements = document.querySelectorAll('[data-animated="true"]');
      if (animatedElements.length === 0) {
        warnings.push('No animated elements found');
      }

      // Test responsive components
      const responsiveElements = document.querySelectorAll('[data-responsive="true"]');
      if (responsiveElements.length === 0) {
        warnings.push('No responsive elements found');
      }

    } catch (error) {
      errors.push(`UI integration error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Modern UI Components Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }

  async testAnimationPerformance(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test animation performance
      let frameCount = 0;
      let animationStartTime = performance.now();
      
      const testAnimation = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - animationStartTime < 1000) {
          requestAnimationFrame(testAnimation);
        } else {
          const fps = frameCount;
          if (fps < 45) {
            warnings.push(`Low animation performance: ${fps} FPS`);
          }
          if (fps < 30) {
            errors.push(`Very low animation performance: ${fps} FPS`);
          }
        }
      };

      requestAnimationFrame(testAnimation);

      // Test for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        warnings.push('User prefers reduced motion - animations may be disabled');
      }

    } catch (error) {
      errors.push(`Animation performance error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Animation Performance Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }

  async testResponsiveDesign(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test responsive breakpoints
      const breakpoints = [320, 768, 1024, 1280];
      const originalWidth = window.innerWidth;

      for (const breakpoint of breakpoints) {
        // Simulate different screen sizes (in testing environment)
        if (process.env.NODE_ENV === 'test') {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: breakpoint,
          });

          // Trigger resize event
          window.dispatchEvent(new Event('resize'));

          // Check if responsive elements adapt
          const responsiveElements = document.querySelectorAll('[data-responsive="true"]');
          responsiveElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            if (!computedStyle.display || computedStyle.display === 'none') {
              warnings.push(`Element may not be responsive at ${breakpoint}px`);
            }
          });
        }
      }

      // Restore original width
      if (process.env.NODE_ENV === 'test') {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: originalWidth,
        });
      }

    } catch (error) {
      errors.push(`Responsive design error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Responsive Design Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }
}

// Test accessibility integrations
export class AccessibilityIntegrationTester {
  async testKeyboardNavigation(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test focusable elements
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        errors.push('No focusable elements found');
      }

      // Test tab order
      let tabIndex = 0;
      focusableElements.forEach(element => {
        const elementTabIndex = element.getAttribute('tabindex');
        if (elementTabIndex && parseInt(elementTabIndex) < 0) {
          warnings.push('Element with negative tabindex found');
        }
      });

      // Test skip links
      const skipLinks = document.querySelectorAll('[href="#main-content"]');
      if (skipLinks.length === 0) {
        warnings.push('No skip links found for accessibility');
      }

    } catch (error) {
      errors.push(`Keyboard navigation error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'Keyboard Navigation Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }

  async testARIALabels(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Test for ARIA labels on interactive elements
      const interactiveElements = document.querySelectorAll('button, [role="button"], input, select, textarea');
      
      interactiveElements.forEach(element => {
        const hasLabel = element.getAttribute('aria-label') || 
                         element.getAttribute('aria-labelledby') ||
                         element.textContent?.trim();
        
        if (!hasLabel) {
          warnings.push('Interactive element without accessible label found');
        }
      });

      // Test for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        warnings.push('No heading elements found');
      }

      // Test for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.getAttribute('alt')) {
          warnings.push('Image without alt text found');
        }
      });

    } catch (error) {
      errors.push(`ARIA labels error: ${error}`);
    }

    const duration = performance.now() - startTime;

    return {
      testName: 'ARIA Labels Integration',
      passed: errors.length === 0,
      duration,
      errors,
      warnings
    };
  }
}

// Main integration test runner
export class IntegrationTestRunner {
  private apiTester = new APIIntegrationTester();
  private uiTester = new UIIntegrationTester();
  private a11yTester = new AccessibilityIntegrationTester();

  async runAllTests(): Promise<IntegrationTestSuite> {
    const startTime = performance.now();
    const results: IntegrationTestResult[] = [];

    try {
      // API Integration Tests
      results.push(await this.apiTester.testGeminiIntegration());
      results.push(await this.apiTester.testClerkIntegration());
      results.push(await this.apiTester.testDrivePersistence());

      // UI Integration Tests
      results.push(await this.uiTester.testModernComponentsIntegration());
      results.push(await this.uiTester.testAnimationPerformance());
      results.push(await this.uiTester.testResponsiveDesign());

      // Accessibility Integration Tests
      results.push(await this.a11yTester.testKeyboardNavigation());
      results.push(await this.a11yTester.testARIALabels());

    } catch (error) {
      results.push({
        testName: 'Test Runner Error',
        passed: false,
        duration: 0,
        errors: [`Test runner error: ${error}`],
        warnings: []
      });
    }

    const totalDuration = performance.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const passRate = (passedTests / results.length) * 100;
    const overallPassed = passRate >= 80; // 80% pass rate required

    const suite: IntegrationTestSuite = {
      suiteName: 'UI Modernization Integration Tests',
      results,
      overallPassed,
      totalDuration,
      passRate
    };

    // Log results in development
    if (process.env.NODE_ENV === 'development') {
      this.logResults(suite);
    }

    // Store results for debugging
    sessionStorage.setItem('integrationTestResults', JSON.stringify(suite));

    return suite;
  }

  private logResults(suite: IntegrationTestSuite): void {
    console.group('🧪 Integration Test Results');
    console.log(`Overall Status: ${suite.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Pass Rate: ${suite.passRate.toFixed(1)}%`);
    console.log(`Total Duration: ${suite.totalDuration.toFixed(2)}ms`);

    console.group('📊 Individual Test Results');
    suite.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName} (${result.duration.toFixed(2)}ms)`);
      
      if (result.errors.length > 0) {
        console.error('  Errors:', result.errors);
      }
      
      if (result.warnings.length > 0) {
        console.warn('  Warnings:', result.warnings);
      }
    });
    console.groupEnd();

    console.groupEnd();
  }
}

// Export singleton instance
export const integrationTestRunner = new IntegrationTestRunner();