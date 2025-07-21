'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'wide' | 'narrow' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const containerVariants = {
  default: 'max-w-7xl mx-auto',
  wide: 'max-w-[1400px] mx-auto',
  narrow: 'max-w-4xl mx-auto',
  full: 'w-full'
};

const paddingVariants = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12',
  xl: 'px-8 sm:px-12 lg:px-16'
};

const animationVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export function ResponsiveContainer({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  animated = false
}: ResponsiveContainerProps) {
  const containerClasses = `
    ${containerVariants[variant]}
    ${paddingVariants[padding]}
    ${className}
  `.trim();

  if (animated) {
    return (
      <motion.div
        className={containerClasses}
        variants={animationVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}