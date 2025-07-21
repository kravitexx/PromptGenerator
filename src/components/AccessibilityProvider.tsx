'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccessibility, useScreenReader, useAriaLiveRegion } from '@/hooks/useAccessibility';

interface AccessibilityContextType {
  settings: ReturnType<typeof useAccessibility>;
  screenReader: ReturnType<typeof useScreenReader>;
  liveRegion: ReturnType<typeof useAriaLiveRegion>;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const settings = useAccessibility();
  const screenReader = useScreenReader();
  const liveRegion = useAriaLiveRegion();
  const [userPreferences, setUserPreferences] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false
  });

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast || userPreferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text mode
    if (settings.largeText || userPreferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion mode
    if (settings.reducedMotion || userPreferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Keyboard navigation mode
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [settings, userPreferences]);

  // Add global accessibility styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Screen reader only class */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Focus visible styles */
      .keyboard-navigation *:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      /* High contrast mode */
      .high-contrast {
        --background: #000000;
        --foreground: #ffffff;
        --primary: #ffffff;
        --primary-foreground: #000000;
        --secondary: #333333;
        --secondary-foreground: #ffffff;
        --muted: #333333;
        --muted-foreground: #cccccc;
        --accent: #ffffff;
        --accent-foreground: #000000;
        --destructive: #ff0000;
        --border: #ffffff;
        --input: #333333;
        --ring: #ffffff;
      }
      
      .high-contrast * {
        border-color: currentColor !important;
      }
      
      .high-contrast button,
      .high-contrast input,
      .high-contrast textarea,
      .high-contrast select {
        border: 2px solid currentColor !important;
      }
      
      /* Large text mode */
      .large-text {
        font-size: 18px;
      }
      
      .large-text h1 { font-size: 2.5rem; }
      .large-text h2 { font-size: 2rem; }
      .large-text h3 { font-size: 1.75rem; }
      .large-text h4 { font-size: 1.5rem; }
      .large-text h5 { font-size: 1.25rem; }
      .large-text h6 { font-size: 1.125rem; }
      
      .large-text button,
      .large-text input,
      .large-text textarea,
      .large-text select {
        font-size: 1.125rem;
        padding: 0.75rem 1rem;
        min-height: 44px;
      }
      
      /* Reduced motion mode */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Touch targets */
      @media (pointer: coarse) {
        button,
        input,
        textarea,
        select,
        a,
        [role="button"],
        [role="link"] {
          min-height: 44px;
          min-width: 44px;
        }
      }
      
      /* Focus indicators */
      :focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      /* Skip links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3b82f6;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleHighContrast = () => {
    setUserPreferences(prev => ({
      ...prev,
      highContrast: !prev.highContrast
    }));
    screenReader.announce(
      `High contrast mode ${userPreferences.highContrast ? 'disabled' : 'enabled'}`
    );
  };

  const toggleLargeText = () => {
    setUserPreferences(prev => ({
      ...prev,
      largeText: !prev.largeText
    }));
    screenReader.announce(
      `Large text mode ${userPreferences.largeText ? 'disabled' : 'enabled'}`
    );
  };

  const toggleReducedMotion = () => {
    setUserPreferences(prev => ({
      ...prev,
      reducedMotion: !prev.reducedMotion
    }));
    screenReader.announce(
      `Reduced motion mode ${userPreferences.reducedMotion ? 'disabled' : 'enabled'}`
    );
  };

  const contextValue: AccessibilityContextType = {
    settings: {
      ...settings,
      highContrast: settings.highContrast || userPreferences.highContrast,
      largeText: settings.largeText || userPreferences.largeText,
      reducedMotion: settings.reducedMotion || userPreferences.reducedMotion
    },
    screenReader,
    liveRegion,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      <liveRegion.LiveRegion />
      
      {/* Accessibility announcements container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="accessibility-announcements"
      />
      
      {/* Skip links */}
      <a
        href="#main-content"
        className="skip-link"
        onFocus={() => screenReader.announce('Skip to main content link focused')}
      >
        Skip to main content
      </a>
    </AccessibilityContext.Provider>
  );
}

// Accessibility settings panel component
export function AccessibilitySettings() {
  const { settings, toggleHighContrast, toggleLargeText, toggleReducedMotion } = useAccessibilityContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          bg-blue-600 text-white p-3 rounded-full shadow-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          hover:bg-blue-700 transition-colors
        "
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="
          absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 min-w-64
          focus:outline-none focus:ring-2 focus:ring-blue-500
        ">
          <h3 className="font-semibold mb-4">Accessibility Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">High Contrast</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={toggleHighContrast}
                className="ml-2"
                aria-describedby="high-contrast-desc"
              />
            </label>
            <p id="high-contrast-desc" className="text-xs text-gray-600">
              Increases contrast for better visibility
            </p>
            
            <label className="flex items-center justify-between">
              <span className="text-sm">Large Text</span>
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={toggleLargeText}
                className="ml-2"
                aria-describedby="large-text-desc"
              />
            </label>
            <p id="large-text-desc" className="text-xs text-gray-600">
              Increases text size for better readability
            </p>
            
            <label className="flex items-center justify-between">
              <span className="text-sm">Reduced Motion</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={toggleReducedMotion}
                className="ml-2"
                aria-describedby="reduced-motion-desc"
              />
            </label>
            <p id="reduced-motion-desc" className="text-xs text-gray-600">
              Reduces animations and transitions
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            <p>Screen Reader: {settings.screenReader ? 'Detected' : 'Not detected'}</p>
            <p>Keyboard Navigation: {settings.keyboardNavigation ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      )}
    </div>
  );
}