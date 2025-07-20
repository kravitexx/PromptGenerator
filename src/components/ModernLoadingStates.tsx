'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  AlertCircle, 
  RefreshCw, 
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

// Skeleton Message Component
export function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  const skeletonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div 
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
    >
      {/* Avatar skeleton */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      )}
      
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'order-2' : ''}`}>
        {/* Message bubble skeleton */}
        <div className={`relative overflow-hidden rounded-2xl p-4 ${
          isUser 
            ? 'bg-gray-200 rounded-br-md' 
            : 'bg-gray-100 rounded-bl-md'
        }`}>
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            animate="animate"
          />
          
          {/* Content lines */}
          <div className="space-y-2 relative z-10">
            <div className="h-4 bg-gray-300 rounded animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        
        {/* Metadata skeleton */}
        <div className={`flex items-center gap-2 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* User avatar skeleton */}
      {isUser && (
        <div className="flex-shrink-0 order-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

// Enhanced Loading Spinner
export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...',
  showText = true 
}: { 
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showText?: boolean;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className="flex items-center justify-center gap-3 p-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={`${sizeClasses[size]} text-blue-500`} />
      </motion.div>
      
      {showText && (
        <motion.span
          className="text-sm text-gray-600 font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.span>
      )}
      
      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Error State Component
export function ErrorState({ 
  message = 'Something went wrong',
  onRetry,
  showRetry = true 
}: {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops!</h3>
      <p className="text-gray-600 mb-4 max-w-sm">{message}</p>
      
      {showRetry && onRetry && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onRetry}
            variant="outline"
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Connection Status Component
export function ConnectionStatus({ 
  isConnected = true,
  isReconnecting = false 
}: {
  isConnected?: boolean;
  isReconnecting?: boolean;
}) {
  return (
    <AnimatePresence>
      {(!isConnected || isReconnecting) && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
            isReconnecting 
              ? 'bg-yellow-100 border border-yellow-200 text-yellow-800'
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            <motion.div
              animate={isReconnecting ? { rotate: 360 } : {}}
              transition={isReconnecting ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              {isReconnecting ? (
                <RefreshCw className="h-4 w-4" />
              ) : isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </motion.div>
            <span className="text-sm font-medium">
              {isReconnecting ? 'Reconnecting...' : 'Connection lost'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Message Loading Placeholder
export function MessageLoadingPlaceholder() {
  return (
    <motion.div
      className="flex gap-3 justify-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Bot avatar */}
      <div className="flex-shrink-0">
        <motion.div 
          className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Bot className="h-5 w-5 text-blue-600" />
        </motion.div>
      </div>
      
      <div className="max-w-[80%]">
        {/* Animated thinking bubble */}
        <motion.div 
          className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl rounded-bl-md p-4 shadow-lg border border-gray-200/50 overflow-hidden"
          animate={{
            boxShadow: [
              '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Content skeleton */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              </motion.div>
              <span className="text-sm text-gray-600">AI is analyzing your request...</span>
            </div>
            
            <div className="space-y-2">
              <motion.div 
                className="h-3 bg-gray-300 rounded"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="h-3 bg-gray-300 rounded w-3/4"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div 
                className="h-3 bg-gray-300 rounded w-1/2"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Chat Loading Screen
export function ChatLoadingScreen() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-64 p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Bot className="h-16 w-16 text-blue-500 mb-6" />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-bold text-gray-700 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Loading Chat
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 text-center max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Preparing your AI assistant and loading conversation history...
      </motion.p>
      
      <motion.div 
        className="flex gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              y: [-4, 0, -4],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Smooth Loading Transition
export function SmoothLoadingTransition({ 
  isLoading, 
  children, 
  fallback,
  delay = 0 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, delay }}
        >
          {fallback || <LoadingSpinner />}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}