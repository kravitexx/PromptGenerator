'use client';

// Browser detection utilities
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supports: {
    webp: boolean;
    avif: boolean;
    backdropFilter: boolean;
    clipPath: boolean;
    gridLayout: boolean;
    flexbox: boolean;
    customProperties: boolean;
    intersectionObserver: boolean;
    resizeObserver: boolean;
    webAnimations: boolean;
    touchEvents: boolean;
    pointerEvents: boolean;
    vibration: boolean;
    webShare: boolean;
    serviceWorker: boolean;
  };
}

// Detect browser information
export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // Browser detection
  let name = 'Unknown';
  let version = '0';
  let engine = 'Unknown';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '0';
    engine = 'Blink';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '0';
    engine = 'Gecko';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || '0';
    engine = 'WebKit';
  } else if (userAgent.includes('Edg')) {
    name = 'Edge';
    version = userAgent.match(/Edg\/(\d+)/)?.[1] || '0';
    engine = 'Blink';
  }
  
  // Device type detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent) && window.innerWidth > 768;
  const isDesktop = !isMobile && !isTablet;
  
  // Feature detection
  const supports = {
    webp: checkWebPSupport(),
    avif: checkAVIFSupport(),
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    clipPath: CSS.supports('clip-path', 'circle(50%)'),
    gridLayout: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex'),
    customProperties: CSS.supports('--custom', 'property'),
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    webAnimations: 'animate' in document.createElement('div'),
    touchEvents: 'ontouchstart' in window,
    pointerEvents: 'onpointerdown' in window,
    vibration: 'vibrate' in navigator,
    webShare: 'share' in navigator,
    serviceWorker: 'serviceWorker' in navigator
  };
  
  return {
    name,
    version,
    engine,
    platform,
    isMobile,
    isTablet,
    isDesktop,
    supports
  };
}

// Check WebP support
function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Check AVIF support
function checkAVIFSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

// CSS fallbacks for unsupported features
export function generateCSSFallbacks(browserInfo: BrowserInfo): string {
  let css = '';
  
  // Backdrop filter fallback
  if (!browserInfo.supports.backdropFilter) {
    css += `
      .backdrop-blur-sm { background-color: rgba(255, 255, 255, 0.8) !important; }
      .backdrop-blur-md { background-color: rgba(255, 255, 255, 0.9) !important; }
      .backdrop-blur-lg { background-color: rgba(255, 255, 255, 0.95) !important; }
    `;
  }
  
  // Grid layout fallback
  if (!browserInfo.supports.gridLayout) {
    css += `
      .grid { display: flex; flex-wrap: wrap; }
      .grid > * { flex: 1; min-width: 200px; }
    `;
  }
  
  // Custom properties fallback
  if (!browserInfo.supports.customProperties) {
    css += `
      :root {
        --primary: #3b82f6;
        --secondary: #6b7280;
        --accent: #10b981;
      }
    `;
  }
  
  return css;
}

// Polyfills for missing features
export function loadPolyfills(browserInfo: BrowserInfo): Promise<void[]> {
  const polyfills: Promise<void>[] = [];
  
  // Intersection Observer polyfill
  if (!browserInfo.supports.intersectionObserver) {
    polyfills.push(
      import('intersection-observer').then(() => {
        console.log('IntersectionObserver polyfill loaded');
      })
    );
  }
  
  // Resize Observer polyfill
  if (!browserInfo.supports.resizeObserver) {
    polyfills.push(
      import('resize-observer-polyfill').then((module) => {
        (window as any).ResizeObserver = module.default;
        console.log('ResizeObserver polyfill loaded');
      }).catch(() => {
        console.warn('ResizeObserver polyfill failed to load');
      })
    );
  }
  
  // Web Animations API polyfill
  if (!browserInfo.supports.webAnimations) {
    polyfills.push(
      import('web-animations-js').then(() => {
        console.log('Web Animations API polyfill loaded');
      }).catch(() => {
        console.warn('Web Animations API polyfill failed to load');
      })
    );
  }
  
  return Promise.all(polyfills);
}

// Browser-specific optimizations
export function applyBrowserOptimizations(browserInfo: BrowserInfo): void {
  // Safari-specific optimizations
  if (browserInfo.name === 'Safari') {
    // Fix Safari's transform3d rendering issues
    document.documentElement.style.setProperty('--webkit-transform-style', 'preserve-3d');
    
    // Optimize scrolling on iOS
    if (browserInfo.isMobile) {
      document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
    }
  }
  
  // Firefox-specific optimizations
  if (browserInfo.name === 'Firefox') {
    // Optimize Firefox's animation performance
    document.documentElement.style.setProperty('--moz-osx-font-smoothing', 'grayscale');
  }
  
  // Chrome-specific optimizations
  if (browserInfo.name === 'Chrome') {
    // Enable hardware acceleration
    document.documentElement.style.setProperty('--webkit-font-smoothing', 'antialiased');
  }
  
  // Mobile-specific optimizations
  if (browserInfo.isMobile) {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
    
    // Optimize touch events
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
  }
}

// Performance optimizations based on browser
export function getBrowserSpecificConfig(browserInfo: BrowserInfo) {
  const config = {
    animationDuration: 0.3,
    staggerDelay: 0.1,
    enableBlur: true,
    enableShadows: true,
    enableTransforms: true,
    enableTransitions: true,
    maxConcurrentAnimations: 10
  };
  
  // Reduce animations for older browsers
  const version = parseInt(browserInfo.version);
  
  if (browserInfo.name === 'Safari' && version < 14) {
    config.enableBlur = false;
    config.animationDuration = 0.2;
    config.maxConcurrentAnimations = 5;
  }
  
  if (browserInfo.name === 'Firefox' && version < 80) {
    config.enableShadows = false;
    config.animationDuration = 0.2;
  }
  
  if (browserInfo.name === 'Chrome' && version < 80) {
    config.staggerDelay = 0.05;
    config.maxConcurrentAnimations = 8;
  }
  
  // Mobile optimizations
  if (browserInfo.isMobile) {
    config.animationDuration = 0.2;
    config.staggerDelay = 0.05;
    config.maxConcurrentAnimations = 5;
    
    // Disable expensive effects on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      config.enableBlur = false;
      config.enableShadows = false;
    }
  }
  
  return config;
}

// Image format selection based on browser support
export function getOptimalImageFormat(browserInfo: BrowserInfo): 'avif' | 'webp' | 'jpg' {
  if (browserInfo.supports.avif) return 'avif';
  if (browserInfo.supports.webp) return 'webp';
  return 'jpg';
}

// Generate responsive image sources
export function generateResponsiveImageSources(
  basePath: string,
  browserInfo: BrowserInfo
): string {
  const format = getOptimalImageFormat(browserInfo);
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  
  return sizes
    .map(size => `${basePath}-${size}w.${format} ${size}w`)
    .join(', ');
}

// Browser compatibility warnings
export function checkCompatibilityWarnings(browserInfo: BrowserInfo): string[] {
  const warnings: string[] = [];
  
  const version = parseInt(browserInfo.version);
  
  // Check for outdated browsers
  if (browserInfo.name === 'Chrome' && version < 80) {
    warnings.push('Your Chrome browser is outdated. Please update for the best experience.');
  }
  
  if (browserInfo.name === 'Firefox' && version < 75) {
    warnings.push('Your Firefox browser is outdated. Please update for the best experience.');
  }
  
  if (browserInfo.name === 'Safari' && version < 13) {
    warnings.push('Your Safari browser is outdated. Please update for the best experience.');
  }
  
  // Check for missing features
  if (!browserInfo.supports.intersectionObserver) {
    warnings.push('Some animations may not work properly in your browser.');
  }
  
  if (!browserInfo.supports.backdropFilter) {
    warnings.push('Some visual effects may appear different in your browser.');
  }
  
  return warnings;
}

// Initialize browser compatibility
export function initializeBrowserCompatibility(): BrowserInfo {
  const browserInfo = getBrowserInfo();
  
  // Apply CSS fallbacks
  const fallbackCSS = generateCSSFallbacks(browserInfo);
  if (fallbackCSS) {
    const style = document.createElement('style');
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
  }
  
  // Apply browser-specific optimizations
  applyBrowserOptimizations(browserInfo);
  
  // Load polyfills
  loadPolyfills(browserInfo).catch(console.warn);
  
  // Log compatibility info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Browser Info:', browserInfo);
    
    const warnings = checkCompatibilityWarnings(browserInfo);
    if (warnings.length > 0) {
      console.warn('Compatibility Warnings:', warnings);
    }
  }
  
  return browserInfo;
}