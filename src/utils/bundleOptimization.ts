'use client';

// Bundle splitting configuration
export const bundleSplitConfig = {
  // Vendor chunks
  vendor: [
    'react',
    'react-dom',
    'next'
  ],
  
  // Animation libraries
  animations: [
    'framer-motion'
  ],
  
  // UI libraries
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-toast',
    'lucide-react'
  ],
  
  // Utility libraries
  utils: [
    'clsx',
    'tailwind-merge',
    'date-fns'
  ]
};

// Dynamic imports for code splitting
export const dynamicImports = {
  // Heavy components that should be lazy loaded
  heavyComponents: () => ({
    PerformanceDashboard: () => import('@/components/PerformanceDashboard'),
    AdvancedLoadingStates: () => import('@/components/AdvancedLoadingStates'),
    GestureChatWindow: () => import('@/components/GestureChatWindow'),
    GesturePromptGenerator: () => import('@/components/GesturePromptGenerator'),
    TouchOptimizedInterface: () => import('@/components/TouchOptimizedInterface')
  }),
  
  // Route-based splitting
  routes: () => ({
    ChatPage: () => import('@/app/chat/page'),
    SettingsPage: () => import('@/app/settings/page').catch(() => ({ default: () => null }))
  }),
  
  // Feature-based splitting
  features: () => ({
    ImageProcessing: () => import('@/lib/imageOptimization'),
    PerformanceMonitoring: () => import('@/lib/performance'),
    GestureHandling: () => import('@/hooks/useGestures')
  })
};

// Tree shaking optimization
export const treeShakingConfig = {
  // Lodash - use specific imports
  lodash: {
    // Bad: import _ from 'lodash'
    // Good: import { debounce, throttle } from 'lodash'
    optimized: [
      'debounce',
      'throttle',
      'merge',
      'cloneDeep'
    ]
  },
  
  // Framer Motion - use specific imports
  framerMotion: {
    // Bad: import * from 'framer-motion'
    // Good: import { motion, AnimatePresence } from 'framer-motion'
    optimized: [
      'motion',
      'AnimatePresence',
      'useAnimation',
      'useInView'
    ]
  },
  
  // Lucide React - use specific imports
  lucideReact: {
    // Bad: import * as Icons from 'lucide-react'
    // Good: import { Home, Settings } from 'lucide-react'
    optimized: [
      'Home',
      'Settings',
      'MessageSquare',
      'Sparkles',
      'Loader2',
      'ChevronLeft',
      'ChevronRight'
    ]
  }
};

// Webpack optimization hints
export const webpackOptimizations = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10
      },
      animations: {
        test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
        name: 'animations',
        chunks: 'all',
        priority: 20
      },
      ui: {
        test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
        name: 'ui',
        chunks: 'all',
        priority: 15
      }
    }
  },
  
  // Minimize bundle size
  minimize: true,
  
  // Remove unused exports
  usedExports: true,
  
  // Enable tree shaking
  sideEffects: false
};

// CSS optimization
export const cssOptimizations = {
  // PurgeCSS configuration
  purgeCSS: {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
      './src/app/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}'
    ],
    safelist: [
      // Keep animation classes
      /^animate-/,
      /^transition-/,
      /^duration-/,
      /^ease-/,
      // Keep responsive classes
      /^sm:/,
      /^md:/,
      /^lg:/,
      /^xl:/,
      // Keep state classes
      /^hover:/,
      /^focus:/,
      /^active:/
    ]
  },
  
  // Critical CSS extraction
  criticalCSS: [
    'base styles',
    'layout styles',
    'above-the-fold styles'
  ],
  
  // CSS minification
  minification: {
    removeComments: true,
    removeWhitespace: true,
    optimizeSelectors: true
  }
};

// Image optimization
export const imageOptimizations = {
  // Next.js Image optimization
  nextImageConfig: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 85
  },
  
  // Lazy loading configuration
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px'
  },
  
  // Responsive images
  responsiveImages: {
    breakpoints: [640, 768, 1024, 1280, 1536],
    formats: ['webp', 'avif', 'jpeg']
  }
};

// Performance budgets
export const performanceBudgets = {
  // Bundle size limits
  bundleSize: {
    maxInitialBundle: '250KB', // gzipped
    maxAsyncChunk: '100KB',    // gzipped
    maxTotalBundle: '1MB'      // gzipped
  },
  
  // Performance metrics
  metrics: {
    firstContentfulPaint: 1500,  // ms
    largestContentfulPaint: 2500, // ms
    firstInputDelay: 100,         // ms
    cumulativeLayoutShift: 0.1    // score
  },
  
  // Resource limits
  resources: {
    maxImages: 50,
    maxFonts: 4,
    maxScripts: 10
  }
};

// Monitoring and alerts
export const performanceMonitoring = {
  // Core Web Vitals thresholds
  coreWebVitals: {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 }
  },
  
  // Custom metrics
  customMetrics: {
    timeToInteractive: 3000,
    totalBlockingTime: 300,
    speedIndex: 3000
  },
  
  // Alerts
  alerts: {
    bundleSizeIncrease: 10, // percentage
    performanceRegression: 20, // percentage
    errorRateThreshold: 1 // percentage
  }
};

// Optimization checklist
export const optimizationChecklist = {
  bundleOptimization: [
    'Code splitting implemented',
    'Tree shaking enabled',
    'Dead code elimination',
    'Vendor chunks separated',
    'Dynamic imports used'
  ],
  
  assetOptimization: [
    'Images optimized and lazy loaded',
    'Fonts preloaded',
    'CSS minified and purged',
    'JavaScript minified',
    'Gzip compression enabled'
  ],
  
  runtimeOptimization: [
    'React.memo used appropriately',
    'useMemo and useCallback optimized',
    'Unnecessary re-renders eliminated',
    'Event listeners cleaned up',
    'Memory leaks prevented'
  ],
  
  networkOptimization: [
    'HTTP/2 enabled',
    'CDN configured',
    'Caching headers set',
    'Service worker implemented',
    'Preloading critical resources'
  ]
};

// Bundle analysis utilities
export function analyzeBundleComposition() {
  if (process.env.NODE_ENV === 'development') {
    console.group('Bundle Analysis');
    
    // Estimate sizes (in a real app, you'd use webpack-bundle-analyzer)
    const estimatedSizes = {
      'React + Next.js': '150KB',
      'Framer Motion': '85KB',
      'Tailwind CSS': '45KB',
      'Lucide Icons': '25KB',
      'Custom Components': '120KB',
      'Utilities': '30KB'
    };
    
    console.table(estimatedSizes);
    console.groupEnd();
  }
}

// Performance recommendations
export function getPerformanceRecommendations() {
  return {
    immediate: [
      'Enable gzip compression',
      'Optimize images with next/image',
      'Implement lazy loading for heavy components',
      'Use React.memo for expensive components'
    ],
    
    shortTerm: [
      'Implement service worker for caching',
      'Add performance monitoring',
      'Optimize CSS with PurgeCSS',
      'Split vendor bundles'
    ],
    
    longTerm: [
      'Implement micro-frontends if needed',
      'Consider server-side rendering optimization',
      'Implement advanced caching strategies',
      'Monitor and optimize Core Web Vitals'
    ]
  };
}

// Initialize bundle optimizations
export function initializeBundleOptimizations() {
  if (typeof window !== 'undefined') {
    // Client-side optimizations
    analyzeBundleComposition();
    
    // Log performance recommendations
    const recommendations = getPerformanceRecommendations();
    console.group('Performance Recommendations');
    console.log('Immediate:', recommendations.immediate);
    console.log('Short-term:', recommendations.shortTerm);
    console.log('Long-term:', recommendations.longTerm);
    console.groupEnd();
  }
}