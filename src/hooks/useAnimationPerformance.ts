'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
  reducedMotion: boolean;
}

// Hook for monitoring animation performance
export function useAnimationPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
    reducedMotion: false
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => {
      setMetrics(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));
    };

    updateReducedMotion();
    mediaQuery.addEventListener('change', updateReducedMotion);

    // FPS monitoring
    let animationId: number;
    
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      frameCountRef.current++;
      
      if (delta >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        const frameTime = delta / frameCountRef.current;
        
        // Keep history of last 10 measurements
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }
        
        // Calculate average FPS
        const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
        const isLowPerformance = avgFPS < 45; // Consider low if consistently below 45fps
        
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(avgFPS),
          frameTime,
          isLowPerformance
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      cancelAnimationFrame(animationId);
      mediaQuery.removeEventListener('change', updateReducedMotion);
    };
  }, []);

  return metrics;
}

// Hook for adaptive animation configuration
export function useAdaptiveAnimations() {
  const performance = useAnimationPerformance();
  
  const getAnimationConfig = useCallback(() => {
    if (performance.reducedMotion) {
      return {
        duration: 0,
        ease: 'linear' as const,
        stagger: 0,
        enabled: false
      };
    }
    
    if (performance.isLowPerformance) {
      return {
        duration: 0.2,
        ease: 'easeOut' as const,
        stagger: 0.05,
        enabled: true,
        simplified: true
      };
    }
    
    return {
      duration: 0.4,
      ease: 'easeInOut' as const,
      stagger: 0.1,
      enabled: true,
      simplified: false
    };
  }, [performance]);

  return {
    ...performance,
    config: getAnimationConfig()
  };
}

// Hook for optimized will-change management
export function useWillChange() {
  const [willChangeProperties, setWillChangeProperties] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setWillChange = useCallback((properties: string[]) => {
    setWillChangeProperties(properties);
    
    // Clear will-change after animation completes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setWillChangeProperties([]);
    }, 1000); // Clear after 1 second
  }, []);

  const clearWillChange = useCallback(() => {
    setWillChangeProperties([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    willChange: willChangeProperties.join(', ') || 'auto',
    setWillChange,
    clearWillChange
  };
}

// Hook for memory-efficient animations
export function useMemoryEfficientAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const elementRef = useRef<HTMLElement>();

  useEffect(() => {
    // Only animate elements that are visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAnimating(true);
          } else {
            setIsAnimating(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: elementRef,
    shouldAnimate: isAnimating
  };
}

// Performance monitoring component
export function AnimationPerformanceMonitor({ 
  children, 
  onPerformanceChange 
}: { 
  children: React.ReactNode;
  onPerformanceChange?: (metrics: PerformanceMetrics) => void;
}) {
  const metrics = useAnimationPerformance();

  useEffect(() => {
    onPerformanceChange?.(metrics);
  }, [metrics, onPerformanceChange]);

  // Show performance warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.isLowPerformance) {
      console.warn('Low animation performance detected:', metrics);
    }
  }, [metrics]);

  return <>{children}</>;
}

// Optimized animation variants
export const optimizedVariants = {
  // GPU-accelerated transforms only
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideUp: {
    initial: { opacity: 0, transform: 'translateY(20px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    exit: { opacity: 0, transform: 'translateY(-20px)' }
  },
  
  scale: {
    initial: { opacity: 0, transform: 'scale(0.9)' },
    animate: { opacity: 1, transform: 'scale(1)' },
    exit: { opacity: 0, transform: 'scale(0.9)' }
  },
  
  // Reduced motion variants
  reducedMotion: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
};

// Performance-optimized transition presets
export const optimizedTransitions = {
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut'
  },
  
  normal: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.8
  },
  
  slow: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 1
  },
  
  reducedMotion: {
    duration: 0,
    ease: 'linear'
  }
};

// Utility for creating performance-aware animations
export function createOptimizedAnimation(
  baseVariants: any,
  performance: PerformanceMetrics
) {
  if (performance.reducedMotion) {
    return optimizedVariants.reducedMotion;
  }
  
  if (performance.isLowPerformance) {
    // Simplify animations for low performance
    return {
      ...baseVariants,
      transition: optimizedTransitions.fast
    };
  }
  
  return baseVariants;
}