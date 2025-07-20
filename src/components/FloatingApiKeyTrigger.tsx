'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiKey } from '@/hooks/useApiKey';
import { FloatingApiKeyManager } from './FloatingApiKeyManager';
import { 
  Key, 
  Settings, 
  Check, 
  AlertTriangle,
  X
} from 'lucide-react';

interface FloatingApiKeyTriggerProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionClasses = {
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6'
};

export function FloatingApiKeyTrigger({ 
  className = '', 
  position = 'top-right' 
}: FloatingApiKeyTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { hasValidKey, isValidating } = useApiKey();

  const getStatusColor = () => {
    if (hasValidKey) return 'from-green-500 to-green-600';
    if (isValidating) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getStatusIcon = () => {
    if (hasValidKey) return <Check className="h-4 w-4" />;
    if (isValidating) return <Settings className="h-4 w-4 animate-spin" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.div
        className={`fixed ${positionClasses[position]} z-30 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full bg-gradient-to-r ${getStatusColor()} text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={!hasValidKey ? { 
            boxShadow: [
              '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
              '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
              '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="key"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Key className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Indicator */}
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
            animate={isValidating ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`text-xs ${
              hasValidKey ? 'text-green-600' : 
              isValidating ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {getStatusIcon()}
            </div>
          </motion.div>

          {/* Pulse Ring for Invalid Key */}
          {!hasValidKey && !isValidating && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 right-16 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {hasValidKey ? 'API Key Active' : 'Configure API Key'}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating API Key Manager */}
      <FloatingApiKeyManager
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </>
  );
}