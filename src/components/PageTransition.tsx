'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4
};

// Enhanced stagger container for child animations with improved timing
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
      when: 'beforeChildren' as const
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
      when: 'afterChildren' as const
    }
  }
};

// Enhanced child animation variants with sophisticated effects
export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.96,
    filter: 'blur(3px)',
    rotateX: 5
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
      type: 'tween' as const
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 1.01,
    filter: 'blur(2px)',
    rotateX: -3,
    transition: {
      duration: 0.25,
      ease: 'easeIn' as const
    }
  }
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Enhanced transition handling with route-specific timing
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Specialized transition components
export function FadeTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();

  const fadeVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={fadeVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function SlideTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();

  const slideVariants = {
    initial: { x: 300, opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: -300, opacity: 0 }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced component for staggered animations
export function StaggerContainer({ 
  children, 
  className = "",
  delay = 0,
  staggerDelay = 0.08,
  direction = 'normal',
  viewport = true
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  direction?: 'normal' | 'reverse';
  viewport?: boolean;
}) {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
        staggerDirection: direction === 'reverse' ? -1 : 1,
        when: 'beforeChildren'
      }
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: direction === 'reverse' ? 1 : -1,
        when: 'afterChildren'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      viewport={viewport ? { once: true, margin: "-50px" } : undefined}
      whileInView={viewport ? "animate" : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Enhanced individual stagger item component
export function StaggerItem({ 
  children, 
  className = "",
  delay = 0,
  direction = 'up',
  intensity = 'normal'
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  intensity?: 'subtle' | 'normal' | 'strong';
}) {
  const getInitialTransform = () => {
    const intensityMap = {
      subtle: { distance: 15, scale: 0.98, blur: 1 },
      normal: { distance: 25, scale: 0.95, blur: 2 },
      strong: { distance: 40, scale: 0.9, blur: 4 }
    };
    
    const { distance, scale, blur } = intensityMap[intensity];
    
    switch (direction) {
      case 'down':
        return { opacity: 0, y: -distance, scale, filter: `blur(${blur}px)` };
      case 'left':
        return { opacity: 0, x: distance, scale, filter: `blur(${blur}px)` };
      case 'right':
        return { opacity: 0, x: -distance, scale, filter: `blur(${blur}px)` };
      case 'scale':
        return { opacity: 0, scale: scale * 0.8, filter: `blur(${blur}px)` };
      default: // 'up'
        return { opacity: 0, y: distance, scale, filter: `blur(${blur}px)` };
    }
  };

  const itemVariants = {
    initial: getInitialTransform(),
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        delay,
        ease: 'easeOut' as const,
        type: 'tween' as const
      }
    },
    exit: {
      opacity: 0,
      y: direction === 'up' ? -15 : direction === 'down' ? 15 : 0,
      x: direction === 'left' ? -15 : direction === 'right' ? 15 : 0,
      scale: 1.02,
      filter: 'blur(1px)',
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Loading transition component
export function LoadingTransition({ 
  isLoading, 
  children, 
  fallback 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {fallback || (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// Advanced page transition effects
export const pageTransitionEffects = {
  // Smooth slide with blur
  slideBlur: {
    initial: {
      opacity: 0,
      x: 100,
      filter: 'blur(4px)',
      scale: 0.95
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      filter: 'blur(2px)',
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: 'easeIn' as const
      }
    }
  },

  // 3D flip effect
  flip3D: {
    initial: {
      opacity: 0,
      rotateY: -90,
      transformPerspective: 1000,
      transformOrigin: 'center'
    },
    animate: {
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const
      }
    },
    exit: {
      opacity: 0,
      rotateY: 90,
      transition: {
        duration: 0.6,
        ease: 'easeIn' as const
      }
    }
  },

  // Zoom with rotation
  zoomRotate: {
    initial: {
      opacity: 0,
      scale: 0.8,
      rotate: -5,
      filter: 'blur(3px)'
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: 'easeOut' as const
      }
    },
    exit: {
      opacity: 0,
      scale: 1.2,
      rotate: 5,
      filter: 'blur(2px)',
      transition: {
        duration: 0.5,
        ease: 'easeIn' as const
      }
    }
  },

  // Elastic bounce
  elasticBounce: {
    initial: {
      opacity: 0,
      scale: 0.3,
      y: 50
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        type: 'spring' as const,
        stiffness: 200,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -30,
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const
      }
    }
  }
};

// Enhanced page transition component with effect selection
export function AdvancedPageTransition({ 
  children, 
  className = "",
  effect = 'default',
  enableStagger = true
}: {
  children: React.ReactNode;
  className?: string;
  effect?: keyof typeof pageTransitionEffects | 'default';
  enableStagger?: boolean;
}) {
  const pathname = usePathname();
  
  const transitionVariant = effect === 'default' 
    ? pageVariants 
    : pageTransitionEffects[effect];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={transitionVariant}
        className={className}
      >
        {enableStagger ? (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Intersection observer based animations for scroll-triggered effects
export function ScrollTriggeredStagger({ 
  children, 
  className = "",
  threshold = 0.1,
  rootMargin = "-50px"
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      exit="exit"
      viewport={{ 
        once: true, 
        margin: rootMargin,
        amount: threshold
      }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
          }
        },
        exit: {
          transition: {
            staggerChildren: 0.05,
            staggerDirection: -1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Magnetic hover effect for interactive elements
export function MagneticHover({ 
  children, 
  className = "",
  strength = 0.3,
  speed = 0.3
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  speed?: number;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength
    });
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        x: isHovered ? mousePosition.x : 0,
        y: isHovered ? mousePosition.y : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: speed
      }}
    >
      {children}
    </motion.div>
  );
}

// Parallax scroll effect
export function ParallaxScroll({ 
  children, 
  className = "",
  speed = 0.5,
  direction = 'vertical'
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const transform = direction === 'vertical' 
    ? `translateY(${scrollY * speed}px)`
    : `translateX(${scrollY * speed}px)`;

  return (
    <motion.div
      className={className}
      style={{ transform }}
      transition={{ type: 'spring', stiffness: 100, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}