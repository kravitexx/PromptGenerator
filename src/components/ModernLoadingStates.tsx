'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Wifi,
  WifiOff,
  Bot,
  MessageSquare,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enhanced Skeleton Message Component
export function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <motion.div 
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
        <div className={`rounded-2xl p-4 relative overflow-hidden ${
          isUser 
            ? 'bg-gradient-to-br from-blue-200/50 to-purple-200/50' 
            : 'bg-gradient-to-br from-gray-100 to-gray-200'
        }`}>
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          <div className="space-y-3 relative z-10">
            {[100, 75, 50].map((width, index) => (
              <motion.div
                key={index}
                className="h-4 bg-gray-300/70 rounded"
                style={{ width: `${width}%` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full relative overflow-hidden order-3">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.div>
  );
}

// Enhanced Error State Component
export function ErrorState({ 
  message = "Something went wrong", 
  onRetry,
  className = "",
  type = 'error'
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
  type?: 'error' | 'network' | 'timeout';
}) {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-orange-500 mb-4" />;
      case 'timeout':
        return <Loader2 className="h-12 w-12 text-yellow-500 mb-4" />;
      default:
        return <AlertCircle className="h-12 w-12 text-red-500 mb-4" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Lost';
      case 'timeout':
        return 'Request Timeout';
      default:
        return 'Oops!';
    }
  };

  return (
    <motion.div 
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {getIcon()}
      </motion.div>
      
      <motion.h3 
        className="text-lg font-semibold text-gray-800 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {getTitle()}
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 mb-6 max-w-md leading-relaxed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
      
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={onRetry} variant="outline" className="gap-2 hover:bg-blue-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced Connection Status Component
export function ConnectionStatus({ 
  isConnected = true,
  className = "",
  showLabel = true
}: {
  isConnected?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <motion.div 
      className={`flex items-center gap-2 text-xs ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={isConnected ? 
          { scale: [1, 1.2, 1] } : 
          { rotate: 360, scale: [1, 1.1, 1] }
        }
        transition={{ 
          duration: isConnected ? 2 : 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </motion.div>
      
      {showLabel && (
        <motion.span 
          className={isConnected ? 'text-green-600' : 'text-red-600'}
          animate={!isConnected ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isConnected ? 'Connected' : 'Reconnecting...'}
        </motion.span>
      )}
    </motion.div>
  );
}

// Enhanced Message Loading Placeholder
export function MessageLoadingPlaceholder({ stage = 'thinking' }: { stage?: 'thinking' | 'processing' | 'generating' }) {
  const getStageInfo = () => {
    switch (stage) {
      case 'processing':
        return { icon: Brain, text: 'Processing your request...', color: 'text-purple-600' };
      case 'generating':
        return { icon: Sparkles, text: 'Generating response...', color: 'text-green-600' };
      default:
        return { icon: Bot, text: 'AI is thinking...', color: 'text-blue-600' };
    }
  };

  const { icon: Icon, text, color } = getStageInfo();

  return (
    <motion.div 
      className="flex gap-3 justify-start"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 1.05 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </motion.div>
      </div>
      
      <div className="max-w-[80%]">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl rounded-bl-md p-4 border border-gray-200/50 relative overflow-hidden shadow-sm">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-blue-50/30"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Loader2 className={`h-4 w-4 ${color} animate-spin`} />
            </motion.div>
            
            <span className="text-sm text-gray-700 font-medium">{text}</span>
            
            {/* Animated dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-gray-400 rounded-full"
                  animate={{
                    y: [-2, 0, -2],
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Chat Loading Screen
export function ChatLoadingScreen() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-96 space-y-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Animated logo */}
      <motion.div
        className="relative"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <MessageSquare className="h-10 w-10 text-white" />
        </div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/60 rounded-full"
            style={{
              left: `${Math.cos(i * 60 * Math.PI / 180) * 40 + 40}px`,
              top: `${Math.sin(i * 60 * Math.PI / 180) * 40 + 40}px`
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
      
      {/* Loading text */}
      <motion.div 
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-gray-800">Loading Chat</h3>
        <p className="text-gray-600 max-w-md">Preparing your AI assistant and loading conversation history...</p>
      </motion.div>
      
      {/* Progress indicator */}
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              y: [-8, 0, -8],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Enhanced Smooth Loading Transition
export function SmoothLoadingTransition({ 
  isLoading, 
  children, 
  fallback,
  loadingText = "Loading..."
}: {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingText?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(2px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {fallback || <ChatLoadingScreen />}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Success State Component
export function SuccessState({ 
  message = "Success!", 
  onContinue,
  className = ""
}: {
  message?: string;
  onContinue?: () => void;
  className?: string;
}) {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
      >
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-bold text-gray-800 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        All Set!
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 mb-6 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {message}
      </motion.p>
      
      {onContinue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={onContinue} className="gap-2">
            <Zap className="h-4 w-4" />
            Continue
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}