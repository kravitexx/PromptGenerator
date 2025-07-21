'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { motion, MotionProps, useAnimation, useInView } from 'framer-motion';
import { 
  useAdaptiveAnimations, 
  useWillChange, 
  useMemoryEfficientAnimation,
  optimizedVariants,
  optimizedTransitions,
  createOptimizedAnimation
} from '@/hooks/useAnimationPerformance';

// Optimized motion component with performance monitoring
interface OptimizedMotionProps extends MotionProps {
  children: React.ReactNode;
  variant?: keyof typeof optimizedVariants;
  enableWillChange?: boolean;
  lazy?: boolean;
}

export const OptimizedMotion = forwardRef<HTMLDivElement, OptimizedMotionProps>(
  ({ children, variant = 'fadeIn', enableWillChange = true, lazy = true, ...props }, ref) => {
    const adaptiveAnimations = useAdaptiveAnimations();
    const { willChange, setWillChange, clearWillChange } = useWillChange();
    const memoryEfficient = useMemoryEfficientAnimation();
    const controls = useAnimation();

    // Use intersection observer for lazy animations
    const shouldAnimate = lazy ? memoryEfficient.shouldAnimate : true;

    useEffect(() => {
      if (shouldAnimate && adaptiveAnimations.config.enabled) {
        if (enableWillChange) {
          setWillChange(['transform', 'opacity']);
        }
        
        controls.start('animate');
      } else {
        controls.start('initial');
        if (enableWillChange) {
          clearWillChange();
        }
      }
    }, [shouldAnimate, adaptiveAnimations.config.enabled, controls, enableWillChange, setWillChange, clearWillChange]);

    const animationVariants = createOptimizedAnimation(
      optimizedVariants[variant],
      adaptiveAnimations
    );

    const transition = adaptiveAnimations.config.reducedMotion 
      ? optimizedTransitions.reducedMotion
      : adaptiveAnimations.config.simplified
      ? optimizedTransitions.fast
      : optimizedTransitions.normal;

    return (
      <motion.div
        ref={lazy ? memoryEfficient.ref : ref}
        variants={animationVariants}
        initial="initial"
        animate={controls}
        exit="exit"
        transition={transition}
        style={{
          willChange: enableWillChange ? willChange : 'auto'
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

OptimizedMotion.displayName = 'OptimizedMotion';

// Optimized stagger container
interface OptimizedStaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function OptimizedStagger({ children, staggerDelay, className }: OptimizedStaggerProps) {
  const adaptiveAnimations = useAdaptiveAnimations();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay ?? adaptiveAnimations.config.stagger,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: optimizedTransitions.normal
    }
  };

  if (adaptiveAnimations.config.reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Optimized scroll-triggered animation
interface OptimizedScrollAnimationProps {
  children: React.ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

export function OptimizedScrollAnimation({ 
  children, 
  threshold = 0.1, 
  triggerOnce = true,
  className 
}: OptimizedScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    threshold, 
    once: triggerOnce,
    margin: '-50px'
  });
  const adaptiveAnimations = useAdaptiveAnimations();
  const { setWillChange, clearWillChange } = useWillChange();

  useEffect(() => {
    if (isInView) {
      setWillChange(['transform', 'opacity']);
      
      // Clear will-change after animation
      const timer = setTimeout(() => {
        clearWillChange();
      }, adaptiveAnimations.config.duration * 1000 + 100);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, setWillChange, clearWillChange, adaptiveAnimations.config.duration]);

  const variants = {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: adaptiveAnimations.config.reducedMotion 
        ? optimizedTransitions.reducedMotion
        : optimizedTransitions.normal
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
    >
      {children}
    </motion.div>
  );
}

// Optimized hover animation
interface OptimizedHoverProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export function OptimizedHover({ children, scale = 1.05, className }: OptimizedHoverProps) {
  const adaptiveAnimations = useAdaptiveAnimations();
  const { setWillChange, clearWillChange } = useWillChange();

  const handleHoverStart = () => {
    if (!adaptiveAnimations.config.reducedMotion) {
      setWillChange(['transform']);
    }
  };

  const handleHoverEnd = () => {
    clearWillChange();
  };

  if (adaptiveAnimations.config.reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale,
        transition: optimizedTransitions.fast
      }}
      whileTap={{ 
        scale: scale * 0.95,
        transition: optimizedTransitions.fast
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      {children}
    </motion.div>
  );
}

// Optimized loading animation
interface OptimizedLoadingProps {
  size?: number;
  color?: string;
  className?: string;
}

export function OptimizedLoading({ size = 24, color = 'currentColor', className }: OptimizedLoadingProps) {
  const adaptiveAnimations = useAdaptiveAnimations();

  if (adaptiveAnimations.config.reducedMotion) {
    return (
      <div 
        className={`inline-block ${className}`}
        style={{ width: size, height: size }}
      >
        <div 
          className="w-full h-full border-2 border-current border-t-transparent rounded-full opacity-50"
          style={{ borderColor: color }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <div 
        className="w-full h-full border-2 border-current border-t-transparent rounded-full"
        style={{ borderColor: color }}
      />
    </motion.div>
  );
}

// Optimized page transition
interface OptimizedPageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function OptimizedPageTransition({ children, className }: OptimizedPageTransitionProps) {
  const adaptiveAnimations = useAdaptiveAnimations();

  const pageVariants = {
    initial: { 
      opacity: 0,
      y: adaptiveAnimations.config.reducedMotion ? 0 : 20
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: adaptiveAnimations.config.duration,
        ease: adaptiveAnimations.config.ease,
        staggerChildren: adaptiveAnimations.config.stagger
      }
    },
    exit: { 
      opacity: 0,
      y: adaptiveAnimations.config.reducedMotion ? 0 : -20,
      transition: {
        duration: adaptiveAnimations.config.duration * 0.5,
        ease: 'easeIn'
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

// Performance debug component (development only)
export function AnimationDebugger() {
  const adaptiveAnimations = useAdaptiveAnimations();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>FPS: {adaptiveAnimations.fps}</div>
      <div>Frame Time: {adaptiveAnimations.frameTime.toFixed(2)}ms</div>
      <div>Low Performance: {adaptiveAnimations.isLowPerformance ? 'Yes' : 'No'}</div>
      <div>Reduced Motion: {adaptiveAnimations.reducedMotion ? 'Yes' : 'No'}</div>
      <div>Animation Duration: {adaptiveAnimations.config.duration}s</div>
    </div>
  );
}