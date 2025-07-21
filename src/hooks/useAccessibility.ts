'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

// Hook for managing accessibility settings
export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: false,
    focusVisible: false
  });

  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => {
      setSettings(prev => ({ ...prev, reducedMotion: reducedMotionQuery.matches }));
    };
    updateReducedMotion();
    reducedMotionQuery.addEventListener('change', updateReducedMotion);

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const updateHighContrast = () => {
      setSettings(prev => ({ ...prev, highContrast: highContrastQuery.matches }));
    };
    updateHighContrast();
    highContrastQuery.addEventListener('change', updateHighContrast);

    // Check for large text preference
    const largeTextQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    const updateLargeText = () => {
      setSettings(prev => ({ ...prev, largeText: largeTextQuery.matches }));
    };
    updateLargeText();
    largeTextQuery.addEventListener('change', updateLargeText);

    // Detect screen reader usage
    const detectScreenReader = () => {
      const isScreenReader = window.navigator.userAgent.includes('NVDA') ||
                            window.navigator.userAgent.includes('JAWS') ||
                            window.navigator.userAgent.includes('VoiceOver') ||
                            window.speechSynthesis !== undefined;
      setSettings(prev => ({ ...prev, screenReader: isScreenReader }));
    };
    detectScreenReader();

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setSettings(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setSettings(prev => ({ ...prev, keyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Focus visible detection
    const handleFocusVisible = () => {
      setSettings(prev => ({ ...prev, focusVisible: true }));
    };

    document.addEventListener('focusin', handleFocusVisible);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateReducedMotion);
      highContrastQuery.removeEventListener('change', updateHighContrast);
      largeTextQuery.removeEventListener('change', updateLargeText);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusVisible);
    };
  }, []);

  return settings;
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const elementsRef = useRef<HTMLElement[]>([]);

  const registerElement = useCallback((element: HTMLElement | null) => {
    if (element && !elementsRef.current.includes(element)) {
      elementsRef.current.push(element);
    }
  }, []);

  const unregisterElement = useCallback((element: HTMLElement) => {
    elementsRef.current = elementsRef.current.filter(el => el !== element);
  }, []);

  const focusNext = useCallback(() => {
    const nextIndex = (currentFocusIndex + 1) % elementsRef.current.length;
    setCurrentFocusIndex(nextIndex);
    elementsRef.current[nextIndex]?.focus();
  }, [currentFocusIndex]);

  const focusPrevious = useCallback(() => {
    const prevIndex = currentFocusIndex <= 0 
      ? elementsRef.current.length - 1 
      : currentFocusIndex - 1;
    setCurrentFocusIndex(prevIndex);
    elementsRef.current[prevIndex]?.focus();
  }, [currentFocusIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          focusNext();
        }
        break;
      case 'ArrowUp':
        if (e.shiftKey && e.key === 'Tab') {
          e.preventDefault();
          focusPrevious();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusPrevious();
        }
        break;
      case 'Home':
        e.preventDefault();
        setCurrentFocusIndex(0);
        elementsRef.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        const lastIndex = elementsRef.current.length - 1;
        setCurrentFocusIndex(lastIndex);
        elementsRef.current[lastIndex]?.focus();
        break;
    }
  }, [focusNext, focusPrevious]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    registerElement,
    unregisterElement,
    currentFocusIndex,
    focusNext,
    focusPrevious
  };
}

// Hook for screen reader announcements
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    
    // Create temporary announcement element
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
      setAnnouncements(prev => prev.filter(a => a !== message));
    }, 1000);
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceLoading = useCallback((message: string = 'Loading') => {
    announce(message, 'polite');
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
    announcements
  };
}

// Hook for focus management
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    focusTrapRef.current = container;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        releaseFocus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const releaseFocus = useCallback(() => {
    focusTrapRef.current = null;
    restoreFocus();
  }, [restoreFocus]);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    releaseFocus
  };
}

// Hook for ARIA live regions
export function useAriaLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const updateLiveRegion = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear after a delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      ref={liveRegionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), []);

  return {
    updateLiveRegion,
    LiveRegion
  };
}

// Utility functions for accessibility
export const a11yUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'a11y') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  },
  
  // Get all focusable elements within a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  },
  
  // Create accessible description
  createDescription: (text: string, id?: string): string => {
    const descId = id || a11yUtils.generateId('desc');
    
    // Create or update description element
    let descElement = document.getElementById(descId);
    if (!descElement) {
      descElement = document.createElement('div');
      descElement.id = descId;
      descElement.className = 'sr-only';
      document.body.appendChild(descElement);
    }
    
    descElement.textContent = text;
    return descId;
  }
};