'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Enhanced Button with micro-interactions
interface InteractiveButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InteractiveButton({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  loading = false
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const handleClick = async () => {
    if (disabled || loading) return;
    
    // Ripple effect animation
    await controls.start({
      scale: [1, 0.95, 1.02, 1],
      transition: { duration: 0.3, ease: 'easeOut' }
    });
    
    onClick?.();
  };

  return (
    <motion.div
      animate={controls}
      whileHover={{ 
        scale: 1.02,
        y: -1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      <Button
        variant={variant}
        size={size}
        className={`relative overflow-hidden transition-all duration-200 ${className}`}
        onClick={handleClick}
        disabled={disabled || loading}
      >
        {/* Ripple effect overlay */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-md"
          initial={{ scale: 0, opacity: 0 }}
          animate={isPressed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
        
        <motion.div
          animate={loading ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </Button>
    </motion.div>
  );
}

// Enhanced Input with focus animations
interface InteractiveInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  error?: string;
  success?: boolean;
  type?: string;
}

export function InteractiveInput({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  error,
  success = false,
  type = 'text'
}: InteractiveInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const borderColor = error 
    ? 'border-red-500' 
    : success 
    ? 'border-green-500' 
    : isFocused 
    ? 'border-blue-500' 
    : 'border-gray-300';

  return (
    <div className="relative">
      {/* Floating label */}
      {placeholder && (
        <motion.label
          className={`absolute left-3 pointer-events-none transition-all duration-200 ${
            isFocused || hasValue
              ? 'top-2 text-xs text-blue-600'
              : 'top-1/2 -translate-y-1/2 text-gray-500'
          }`}
          animate={{
            y: isFocused || hasValue ? -8 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280'
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {placeholder}
        </motion.label>
      )}
      
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={`transition-all duration-200 ${borderColor} ${
            placeholder ? 'pt-6 pb-2' : ''
          } ${className}`}
          placeholder={placeholder && !isFocused && !hasValue ? '' : undefined}
        />
      </motion.div>
      
      {/* Focus ring */}
      <motion.div
        className="absolute inset-0 rounded-md pointer-events-none"
        initial={{ opacity: 0, scale: 1 }}
        animate={isFocused ? { 
          opacity: 1, 
          scale: 1.02,
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        } : { 
          opacity: 0, 
          scale: 1,
          boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Error message */}
      {error && (
        <motion.p
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      
      {/* Success indicator */}
      {success && (
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <motion.svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced Textarea with auto-resize and focus effects
interface InteractiveTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  error?: string;
  minRows?: number;
  maxRows?: number;
}

export function InteractiveTextarea({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  error,
  minRows = 3,
  maxRows = 10
}: InteractiveTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    };

    adjustHeight();
  }, [value, minRows, maxRows]);

  return (
    <div className="relative">
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={`transition-all duration-200 resize-none overflow-hidden ${
            error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'
          } ${className}`}
          style={{ minHeight: `${minRows * 1.5}rem` }}
        />
      </motion.div>
      
      {/* Focus ring */}
      <motion.div
        className="absolute inset-0 rounded-md pointer-events-none"
        initial={{ opacity: 0, scale: 1 }}
        animate={isFocused ? { 
          opacity: 1, 
          scale: 1.01,
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        } : { 
          opacity: 0, 
          scale: 1,
          boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Character count */}
      {value && (
        <motion.div
          className="absolute bottom-2 right-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {value.length}
        </motion.div>
      )}
      
      {/* Error message */}
      {error && (
        <motion.p
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Magnetic hover effect component
interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticHover({ 
  children, 
  strength = 0.3,
  className = ''
}: MagneticHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) * strength;
    const deltaY = (event.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Ripple effect component
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function RippleEffect({ 
  children, 
  className = '',
  color = 'rgba(255, 255, 255, 0.3)'
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const nextRippleId = useRef(0);

  const createRipple = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: nextRippleId.current++,
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={createRipple}
    >
      {children}
      
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}