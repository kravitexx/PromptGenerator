'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  animate?: boolean;
  delay?: number;
}

export function ModernContainer({ 
  children, 
  className = "",
  variant = 'default',
  animate = true,
  delay = 0
}: ModernContainerProps) {
  const baseClasses = "relative overflow-hidden";
  
  const variantClasses = {
    default: "bg-background border border-border rounded-lg shadow-sm",
    glass: "glass-card border-0 shadow-lg",
    gradient: "gradient-primary rounded-lg shadow-lg"
  };

  const containerVariants = {
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
        delay,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    variants: containerVariants,
    initial: "hidden",
    animate: "visible",
    whileHover: variant === 'glass' ? "hover" : undefined,
    ...hoverVariants
  } : {};

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        variant === 'glass' && 'hover-glow',
        className
      )}
      {...motionProps}
    >
      {/* Background Effects for Glass Variant */}
      {variant === 'glass' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        </>
      )}
      
      {/* Background Effects for Gradient Variant */}
      {variant === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/5 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}

// Specialized container variants
export function GlassContainer({ children, className = "", ...props }: Omit<ModernContainerProps, 'variant'>) {
  return (
    <ModernContainer variant="glass" className={className} {...props}>
      {children}
    </ModernContainer>
  );
}

export function GradientContainer({ children, className = "", ...props }: Omit<ModernContainerProps, 'variant'>) {
  return (
    <ModernContainer variant="gradient" className={className} {...props}>
      {children}
    </ModernContainer>
  );
}

export function DefaultContainer({ children, className = "", ...props }: Omit<ModernContainerProps, 'variant'>) {
  return (
    <ModernContainer variant="default" className={className} {...props}>
      {children}
    </ModernContainer>
  );
}