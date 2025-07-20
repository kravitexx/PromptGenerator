'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

// Animation variants for typing dots
const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: {
    y: [-4, 0, -4],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Container animation
const containerVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Shimmer effect for the bubble
const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export function ModernTypingIndicator() {
  return (
    <motion.div 
      className="flex gap-3 justify-start"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Enhanced bot avatar */}
      <motion.div 
        className="flex-shrink-0"
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
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Bot className="h-5 w-5 text-blue-600" />
          </motion.div>
        </div>
      </motion.div>
      
      <div className="max-w-[80%]">
        {/* Modern typing bubble */}
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
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            variants={shimmerVariants}
            animate="animate"
          />
          
          {/* Typing dots container */}
          <div className="relative z-10 flex items-center gap-1">
            <span className="text-sm text-gray-600 mr-2">AI is thinking</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Pulse effect overlay */}
          <motion.div
            className="absolute inset-0 bg-blue-500/5 rounded-2xl"
            animate={{
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
        
        {/* Message tail */}
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 transform rotate-45 border-r border-b border-gray-200/50" />
        
        {/* Floating particles effect */}
        <div className="relative">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: '-10px'
              }}
              animate={{
                y: [-5, -15, -5],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}