'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
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
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export function ResponsiveGrid({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className = '',
  animate = true
}: ResponsiveGridProps) {
  const gridClasses = [
    `grid`,
    `gap-${gap}`,
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  className = ''
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

// Responsive section component
interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'muted' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveSection({ 
  children, 
  className = '',
  background = 'default',
  padding = 'lg'
}: ResponsiveSectionProps) {
  const backgroundClasses = {
    default: '',
    muted: 'bg-gray-50/50',
    gradient: 'bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30'
  };

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
  };

  const sectionClasses = [
    'w-full',
    backgroundClasses[background],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    </section>
  );
}

// Responsive card grid specifically for cards
interface ResponsiveCardGridProps {
  children: React.ReactNode;
  minCardWidth?: string;
  gap?: number;
  className?: string;
  animate?: boolean;
}

export function ResponsiveCardGrid({ 
  children, 
  minCardWidth = '300px',
  gap = 6,
  className = '',
  animate = true
}: ResponsiveCardGridProps) {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    'grid-cols-1',
    'sm:grid-cols-2',
    'lg:grid-cols-3',
    'xl:grid-cols-4',
    className
  ].filter(Boolean).join(' ');

  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`
  };

  if (animate) {
    return (
      <motion.div
        className={gridClasses}
        style={gridStyle}
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
    <div className={gridClasses} style={gridStyle}>
      {children}
    </div>
  );
}

// ResponsiveFlex component for flexible layouts
interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number;
  className?: string;
}

export function ResponsiveFlex({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 4,
  className = ''
}: ResponsiveFlexProps) {
  const flexClasses = [
    'flex',
    `flex-${direction}`,
    `justify-${justify}`,
    `items-${align}`,
    wrap ? 'flex-wrap' : 'flex-nowrap',
    `gap-${gap}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}