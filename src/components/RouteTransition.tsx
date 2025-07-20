'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface RouteTransitionProps {
  children: React.ReactNode;
}

// Enhanced route-specific transition variants with smooth effects
const routeTransitions = {
  '/': {
    initial: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.05, 
      y: -20,
      filter: 'blur(2px)',
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const
      }
    }
  },
  '/chat': {
    initial: { 
      opacity: 0, 
      x: 50,
      rotateY: -15,
      transformPerspective: 1000
    },
    animate: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      rotateY: 15,
      transition: {
        duration: 0.4,
        ease: 'easeIn' as const
      }
    }
  },
  '/formats': {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const
      }
    }
  },
  default: {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const
      }
    }
  }
};

const transitionConfig = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.4
};

// Enhanced loading overlay component with sophisticated animations
function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' as const }}
          className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center"
        >
          {/* Animated background pattern with improved effects */}
          <motion.div
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 1],
              rotate: [0, 270, 360],
              opacity: [0, 0.3, 0.1]
            }}
            transition={{ 
              duration: 2,
              ease: 'easeOut' as const,
              times: [0, 0.7, 1]
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-full blur-3xl"
          />
          
          {/* Floating particles effect */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100
              }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                rotate: 360
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
            />
          ))}
          
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.5,
                delay: 0.1,
                ease: 'easeOut' as const
              }
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0, 
              y: -20,
              transition: {
                duration: 0.3,
                ease: 'easeIn' as const
              }
            }}
            className="glass-card p-8 flex items-center gap-4 relative z-10 shadow-2xl"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: {
                  duration: 1.2,
                  ease: 'linear',
                  repeat: Infinity
                },
                scale: {
                  duration: 2.5,
                  ease: 'easeInOut',
                  repeat: Infinity
                }
              }}
            >
              <Loader2 className="h-6 w-6 text-primary" />
            </motion.div>
            
            <motion.span
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-base text-muted-foreground font-medium"
            >
              Transitioning
            </motion.span>
            
            {/* Enhanced loading dots animation */}
            <div className="flex gap-1.5 ml-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2, scale: 0.8 }}
                  animate={{ 
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.3, 0.8],
                    y: [0, -4, 0]
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut'
                  }}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [transitionKey, setTransitionKey] = useState(0);

  // Get transition variant for current route
  const getTransitionVariant = (path: string) => {
    return routeTransitions[path as keyof typeof routeTransitions] || routeTransitions.default;
  };

  // Determine transition direction based on route hierarchy
  const getTransitionDirection = (from: string, to: string) => {
    const routeHierarchy = ['/', '/chat', '/formats'];
    const fromIndex = routeHierarchy.indexOf(from);
    const toIndex = routeHierarchy.indexOf(to);
    
    if (fromIndex === -1 || toIndex === -1) return 'forward';
    return toIndex > fromIndex ? 'forward' : 'backward';
  };

  // Enhanced route change handler with smooth transitions
  useEffect(() => {
    if (pathname !== previousPath) {
      const direction = getTransitionDirection(previousPath, pathname);
      setTransitionDirection(direction);
      setIsLoading(true);
      
      // Increment transition key to force re-render with new animations
      setTransitionKey(prev => prev + 1);
      
      // Staggered loading completion for smoother experience
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 150);

      const pathUpdateTimer = setTimeout(() => {
        setPreviousPath(pathname);
      }, 350);

      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(pathUpdateTimer);
      };
    }
  }, [pathname, previousPath]);

  const currentVariant = getTransitionVariant(pathname);

  // Enhanced variant modification with better direction handling
  const enhancedVariant = {
    ...currentVariant,
    initial: {
      ...currentVariant.initial,
      ...(transitionDirection === 'backward' && 
        'x' in currentVariant.initial && {
        x: -Math.abs(currentVariant.initial.x as number)
      }),
      ...(transitionDirection === 'backward' && 
        !('x' in currentVariant.initial) && {
        x: -30
      })
    },
    exit: {
      ...currentVariant.exit,
      ...(transitionDirection === 'backward' && 
        'x' in currentVariant.exit && {
        x: Math.abs(currentVariant.exit.x as number)
      }),
      ...(transitionDirection === 'backward' && 
        !('x' in currentVariant.exit) && {
        x: 30
      })
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${pathname}-${transitionKey}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={enhancedVariant}
          className="min-h-screen"
        >
          {/* Enhanced stagger container with better timing */}
          <motion.div
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.15,
                  when: 'beforeChildren'
                }
              },
              exit: {
                transition: {
                  staggerChildren: 0.05,
                  staggerDirection: -1,
                  when: 'afterChildren'
                }
              }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// Hook for programmatic navigation with transitions
export function useRouteTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateWithTransition = async (href: string, options?: { replace?: boolean }) => {
    setIsTransitioning(true);
    
    // Add a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (options?.replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
    
    // Reset transition state after navigation
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return {
    navigateWithTransition,
    isTransitioning
  };
}

// Enhanced Link component with transitions
export function TransitionLink({ 
  href, 
  children, 
  className = "",
  replace = false,
  ...props 
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  [key: string]: any;
}) {
  const { navigateWithTransition, isTransitioning } = useRouteTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition(href, { replace });
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <motion.div
        animate={isTransitioning ? { opacity: 0.7 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.a>
  );
}

// Page transition wrapper for individual pages
export function PageWrapper({ 
  children, 
  className = "",
  variant = 'default' 
}: {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof routeTransitions | 'default';
}) {
  const transitionVariant = routeTransitions[variant] || routeTransitions.default;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={transitionVariant}
      transition={transitionConfig}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Advanced route transition effects for specific use cases
export const advancedRouteEffects = {
  // Smooth slide with depth
  slideDepth: {
    initial: {
      opacity: 0,
      x: 100,
      z: -100,
      rotateY: -15,
      filter: 'blur(4px)'
    },
    animate: {
      opacity: 1,
      x: 0,
      z: 0,
      rotateY: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      z: 100,
      rotateY: 15,
      filter: 'blur(2px)',
      transition: {
        duration: 0.5,
        ease: 'easeIn' as const
      }
    }
  },

  // Morphing transition
  morph: {
    initial: {
      opacity: 0,
      scale: 0.8,
      borderRadius: '50%',
      filter: 'blur(8px)'
    },
    animate: {
      opacity: 1,
      scale: 1,
      borderRadius: '0%',
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
        staggerChildren: 0.12,
        delayChildren: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 1.2,
      borderRadius: '50%',
      filter: 'blur(4px)',
      transition: {
        duration: 0.4,
        ease: 'easeIn' as const
      }
    }
  },

  // Liquid transition
  liquid: {
    initial: {
      opacity: 0,
      scaleY: 0,
      transformOrigin: 'bottom',
      filter: 'blur(6px)'
    },
    animate: {
      opacity: 1,
      scaleY: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    },
    exit: {
      opacity: 0,
      scaleY: 0,
      transformOrigin: 'top',
      filter: 'blur(3px)',
      transition: {
        duration: 0.4,
        ease: 'easeIn' as const
      }
    }
  }
};

// Enhanced route transition component with effect selection
export function EnhancedRouteTransition({ 
  children,
  effect = 'default',
  className = ""
}: {
  children: React.ReactNode;
  effect?: keyof typeof advancedRouteEffects | 'default';
  className?: string;
}) {
  const pathname = usePathname();
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    setTransitionKey(prev => prev + 1);
  }, [pathname]);

  const transitionVariant = effect === 'default' 
    ? routeTransitions[pathname as keyof typeof routeTransitions] || routeTransitions.default
    : advancedRouteEffects[effect];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${pathname}-${transitionKey}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={transitionVariant}
        className={className}
      >
        <motion.div
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1
              }
            }
          }}
          initial="initial"
          animate="animate"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}