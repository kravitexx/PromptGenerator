'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Loading state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AdvancedLoadingProps {
  state: LoadingState;
  message?: string;
  progress?: number;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

// Shimmer loading component
export function ShimmerLoader({ 
  className = '', 
  lines = 3, 
  height = 'h-4',
  animated = true 
}: { 
  className?: string; 
  lines?: number; 
  height?: string;
  animated?: boolean;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gray-200 rounded-md relative overflow-hidden ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Progressive loading component
export function ProgressiveLoader({ 
  progress = 0, 
  message = 'Loading...', 
  className = '',
  showPercentage = true,
  animated = true
}: { 
  progress?: number; 
  message?: string; 
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0, 
            ease: 'easeOut' 
          }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Skeleton components for different content types
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
          <ShimmerLoader lines={3} />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonPromptCard({ className = '' }: { className?: string }) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
            ))}
          </div>
          
          {/* Actions skeleton */}
          <div className="flex gap-2 pt-4">
            <div className="h-9 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-9 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main advanced loading component
export function AdvancedLoading({
  state,
  message,
  progress,
  onRetry,
  className = '',
  variant = 'default',
  size = 'md'
}: AdvancedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerClasses = {
    default: 'flex flex-col items-center justify-center p-8 space-y-4',
    minimal: 'flex items-center space-x-2',
    card: 'bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center space-y-4',
    inline: 'inline-flex items-center space-x-2'
  };

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />;
      case 'success':
        return <CheckCircle className={`${sizeClasses[size]} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${sizeClasses[size]} text-red-600`} />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (state) {
      case 'loading':
        return 'Loading...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Something went wrong';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {state !== 'idle' && (
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`${containerClasses[variant]} ${className}`}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: state === 'loading' ? 360 : 0,
              scale: state === 'success' ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 1, repeat: state === 'loading' ? Infinity : 0, ease: 'linear' },
              scale: { duration: 0.3, ease: 'easeOut' }
            }}
          >
            {getIcon()}
          </motion.div>
          
          {variant !== 'minimal' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-gray-700 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}
            >
              {getMessage()}
            </motion.p>
          )}
          
          {progress !== undefined && state === 'loading' && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-xs"
            >
              <ProgressiveLoader progress={progress} message="" showPercentage={false} />
            </motion.div>
          )}
          
          {state === 'error' && onRetry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Loading overlay component
export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  progress,
  className = '' 
}: { 
  isVisible: boolean; 
  message?: string; 
  progress?: number;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4"
          >
            <AdvancedLoading
              state="loading"
              message={message}
              progress={progress}
              variant="default"
              size="lg"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Smooth error-to-success transition component
export function ErrorToSuccessTransition({
  isError,
  isSuccess,
  errorMessage = 'Something went wrong',
  successMessage = 'Success!',
  onRetry,
  className = ''
}: {
  isError: boolean;
  isSuccess: boolean;
  errorMessage?: string;
  successMessage?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const currentState: LoadingState = isError ? 'error' : isSuccess ? 'success' : 'idle';
  const currentMessage = isError ? errorMessage : isSuccess ? successMessage : '';

  return (
    <AnimatePresence mode="wait">
      {(isError || isSuccess) && (
        <motion.div
          key={currentState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={className}
        >
          <AdvancedLoading
            state={currentState}
            message={currentMessage}
            onRetry={onRetry}
            variant="card"
            size="md"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}