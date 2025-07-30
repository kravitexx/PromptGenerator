'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Component-specific animation variants
export const componentVariants: Record<string, Variants> = {
  // Card animations
  card: {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    },
    hover: {
      y: -2,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  },

  // Modal animations
  modal: {
    initial: {
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  // Sidebar animations
  sidebar: {
    initial: {
      x: -300,
      opacity: 0
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: {
      x: -300,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  },

  // Button animations
  button: {
    initial: {
      scale: 1
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: 'easeIn'
      }
    }
  },

  // List item animations
  listItem: {
    initial: {
      opacity: 0,
      x: -20
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  // Notification animations
  notification: {
    initial: {
      opacity: 0,
      y: -50,
      scale: 0.9
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  // Chat message animations
  chatMessage: {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  // Loading spinner animations
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  },

  // Pulse animation for loading states
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  }
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
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
};

// Generic animated component wrapper
interface AnimatedComponentProps {
  children: React.ReactNode;
  variant?: keyof typeof componentVariants;
  className?: string;
  delay?: number;
  duration?: number;
  onClick?: () => void;
  whileHover?: boolean;
  whileTap?: boolean;
}

export function AnimatedComponent({
  children,
  variant = 'card',
  className = '',
  delay = 0,
  duration,
  onClick,
  whileHover = true,
  whileTap = true,
  ...props
}: AnimatedComponentProps) {
  const variants = componentVariants[variant];
  
  // Override duration if provided
  const customVariants = duration ? {
    ...variants,
    animate: {
      ...variants.animate,
      transition: {
        ...(variants.animate as any)?.transition,
        duration
      }
    }
  } : variants;

  // Add delay if provided
  if (delay > 0 && (customVariants.animate as any)?.transition) {
    (customVariants.animate as any).transition.delay = delay;
  }

  return (
    <motion.div
      variants={customVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={whileHover ? "hover" : undefined}
      whileTap={whileTap ? "tap" : undefined}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Specialized components for common use cases
export function AnimatedCard({ children, className = '', ...props }: Omit<AnimatedComponentProps, 'variant'>) {
  return (
    <AnimatedComponent variant="card" className={className} {...props}>
      {children}
    </AnimatedComponent>
  );
}

export function AnimatedModal({ children, className = '', ...props }: Omit<AnimatedComponentProps, 'variant'>) {
  return (
    <AnimatedComponent variant="modal" className={className} whileHover={false} whileTap={false} {...props}>
      {children}
    </AnimatedComponent>
  );
}

export function AnimatedButton({ children, className = '', ...props }: Omit<AnimatedComponentProps, 'variant'>) {
  return (
    <AnimatedComponent variant="button" className={className} {...props}>
      {children}
    </AnimatedComponent>
  );
}

export function AnimatedListItem({ children, className = '', ...props }: Omit<AnimatedComponentProps, 'variant'>) {
  return (
    <AnimatedComponent variant="listItem" className={className} whileHover={false} {...props}>
      {children}
    </AnimatedComponent>
  );
}

export function AnimatedChatMessage({ children, className = '', ...props }: Omit<AnimatedComponentProps, 'variant'>) {
  return (
    <AnimatedComponent variant="chatMessage" className={className} whileHover={false} whileTap={false} {...props}>
      {children}
    </AnimatedComponent>
  );
}

// Stagger container for animating lists
export function StaggeredList({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  delayChildren = 0.2 
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) {
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren
      }
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Loading animation component
export function LoadingAnimation({ 
  type = 'spinner',
  className = '',
  size = 'md' 
}: {
  type?: 'spinner' | 'pulse';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (type === 'spinner') {
    return (
      <motion.div
        variants={componentVariants.spinner}
        animate="animate"
        className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full ${className}`}
      />
    );
  }

  return (
    <motion.div
      variants={componentVariants.pulse}
      animate="animate"
      className={`${sizeClasses[size]} bg-primary rounded-full ${className}`}
    />
  );
}

// Notification component with animations
export function AnimatedNotification({
  children,
  isVisible,
  onClose,
  className = '',
  autoClose = true,
  duration = 3000
}: {
  children: React.ReactNode;
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}) {
  React.useEffect(() => {
    if (isVisible && autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, onClose, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={componentVariants.notification}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`fixed top-4 right-4 z-50 ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Backdrop component for modals
export function AnimatedBackdrop({
  isVisible,
  onClick,
  className = ''
}: {
  isVisible: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 ${className}`}
          onClick={onClick}
        />
      )}
    </AnimatePresence>
  );
}