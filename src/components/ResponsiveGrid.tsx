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
  animated?: boolean;
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
  animated = true
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

  if (animated) {
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
    'mx-auto',
    maxWidth !== 'full' && `max-w-${maxWidth}`,
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Responsive flex component
interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  responsive?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: string;
  wrap?: boolean;
}

export function ResponsiveFlex({ 
  children, 
  className = '', 
  direction = 'row',
  responsive = true,
  align = 'start',
  justify = 'start',
  gap = 'gap-4',
  wrap = false
}: ResponsiveFlexProps) {
  const flexClasses = [
    'flex',
    responsive && direction === 'row' ? 'flex-col sm:flex-row' : `flex-${direction}`,
    !responsive && `flex-${direction}`,
    `items-${align}`,
    `justify-${justify}`,
    gap,
    wrap && 'flex-wrap',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}

// Responsive card grid specifically for prompt cards
interface PromptCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function PromptCardGrid({ children, className = '' }: PromptCardGridProps) {
  return (
    <ResponsiveGrid
      columns={{ sm: 1, md: 1, lg: 2, xl: 2 }}
      gap="gap-6"
      className={className}
      animated={true}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Responsive stats grid
interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className = '' }: StatsGridProps) {
  return (
    <ResponsiveGrid
      columns={{ sm: 1, md: 2, lg: 4, xl: 4 }}
      gap="gap-4"
      className={className}
      animated={true}
    >
      {children}
    </ResponsiveGrid>
  );
}