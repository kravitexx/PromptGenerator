'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  animate?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

export function ResponsiveGrid({ 
  children, 
  className = '', 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-6',
  animate = true
}: ResponsiveGridProps) {
  const gridClasses = [
    'grid',
    `grid-cols-${columns.sm || 1}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    gap,
    className
  ].filter(Boolean).join(' ');

  if (animate) {
    return (
      <motion.div
        className={gridClasses}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="w-full"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = 'xl',
  padding = true
}: ResponsiveContainerProps) {
  const containerClasses = [
    'w-full',
    maxWidth !== 'full' && `max-w-${maxWidth}`,
    'mx-auto',
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Responsive card grid specifically for prompt cards
interface ResponsiveCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardGrid({ children, className = '' }: ResponsiveCardGridProps) {
  return (
    <ResponsiveGrid
      columns={{ sm: 1, md: 2, lg: 2, xl: 3 }}
      gap="gap-4 sm:gap-6"
      className={className}
      animate={true}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Responsive stats grid
interface ResponsiveStatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveStatsGrid({ children, className = '' }: ResponsiveStatsGridProps) {
  return (
    <ResponsiveGrid
      columns={{ sm: 2, md: 4, lg: 4, xl: 6 }}
      gap="gap-3 sm:gap-4"
      className={className}
      animate={true}
    >
      {children}
    </ResponsiveGrid>
  );
}