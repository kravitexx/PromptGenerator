'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

// State transition types
export type TransitionState = 'idle' | 'loading' | 'success' | 'error' | 'warning';

interface StateTransitionProps {
  state: TransitionState;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  message?: string;
}

// State transition animations
const stateVariants = {
  idle: {
    scale: 1,
    opacity: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgba(229, 231, 235, 1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  loading: {
    scale: 1.02,
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  success: {
    scale: 1.05,
    opacity: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  error: {
    scale: 1.02,
    opacity: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  warning: {
    scale: 1.02,
    opacity: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const iconVariants = {
  enter: {
    scale: 0,
    rotate: -180,
    opacity: 0,
    transition: { duration: 0.2 }
  },
  center: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { 
      duration: 0.4, 
      ease: 'easeOut',
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export function StateTransition({ 
  state, 
  children, 
  className = '',
  showIcon = true,
  message
}: StateTransitionProps) {
  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStateMessage = () => {
    if (message) return message;
    
    switch (state) {
      case 'loading':
        return 'Processing...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error occurred';
      case 'warning':
        return 'Warning';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`relative border rounded-lg p-4 ${className}`}
      variants={stateVariants}
      animate={state}
      layout
    >
      {/* State indicator */}
      {showIcon && state !== 'idle' && (
        <div className="absolute top-2 right-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              variants={iconVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {getStateIcon()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Content */}
      <motion.div
        animate={state === 'loading' ? { opacity: 0.6 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* State message */}
      <AnimatePresence>
        {state !== 'idle' && getStateMessage() && (
          <motion.div
            className={`mt-2 text-sm font-medium ${
              state === 'success' ? 'text-green-600' :
              state === 'error' ? 'text-red-600' :
              state === 'warning' ? 'text-yellow-600' :
              'text-blue-600'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {getStateMessage()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Progress state component
interface ProgressStateProps {
  progress: number;
  state: TransitionState;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export function ProgressState({ 
  progress, 
  state, 
  className = '',
  showPercentage = true,
  animated = true
}: ProgressStateProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  const getProgressColor = () => {
    switch (state) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <motion.span
            className="text-sm text-gray-500"
            key={displayProgress}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(displayProgress)}%
          </motion.span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getProgressColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0,
            ease: 'easeOut'
          }}
        />
      </div>
    </div>
  );
}

// Multi-step state component
interface Step {
  id: string;
  label: string;
  state: TransitionState;
}

interface MultiStepStateProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

export function MultiStepState({ steps, currentStep, className = '' }: MultiStepStateProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;

        return (
          <motion.div
            key={step.id}
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Step indicator */}
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="h-4 w-4" />
                </motion.div>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Step label */}
            <motion.span
              className={`text-sm font-medium ${
                isActive
                  ? 'text-blue-600'
                  : isCompleted
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
              animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {step.label}
            </motion.span>

            {/* Loading indicator for active step */}
            {isActive && step.state === 'loading' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Toast notification component
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ 
  type, 
  title, 
  message, 
  duration = 5000,
  onClose
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <motion.div
      className={`border rounded-lg p-4 shadow-lg ${getToastStyles()}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      layout
    >
      <div className="flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {getIcon()}
        </motion.div>
        
        <div className="flex-1">
          <motion.h4
            className="font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h4>
          
          {message && (
            <motion.p
              className="text-sm mt-1 opacity-80"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.8, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.p>
          )}
        </div>
        
        {onClose && (
          <motion.button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XCircle className="h-4 w-4" />
          </motion.button>
        )}
      </div>
      
      {/* Progress bar for duration */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}