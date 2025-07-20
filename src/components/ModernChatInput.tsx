'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageDropZone } from '@/components/ImageDropZone';
import { 
  Send, 
  Image as ImageIcon,
  Plus,
  Minus,
  Mic,
  Paperclip,
  Smile,
  X
} from 'lucide-react';

interface ModernChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  images: string[];
  onImagesChange: (images: string[]) => void;
  showImageDropZone: boolean;
  onToggleImageDropZone: () => void;
  maxLength?: number;
}

// Animation variants
const inputContainerVariants = {
  initial: { 
    scale: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  focused: { 
    scale: 1.02,
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const labelVariants = {
  initial: {
    y: 0,
    scale: 1,
    color: '#9CA3AF'
  },
  focused: {
    y: -24,
    scale: 0.85,
    color: '#3B82F6',
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const typingDotsVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export function ModernChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  images,
  onImagesChange,
  showImageDropZone,
  onToggleImageDropZone,
  maxLength = 2000
}: ModernChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  // Handle typing indicator
  useEffect(() => {
    if (value.length > 0) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const isLabelFloating = isFocused || value.length > 0;
  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="space-y-4">
      {/* Image Drop Zone */}
      <AnimatePresence>
        {showImageDropZone && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ImageDropZone
              onImagesChange={onImagesChange}
              maxImages={3}
              disabled={disabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2 flex-wrap"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container */}
      <motion.div
        className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
        variants={inputContainerVariants}
        initial="initial"
        animate={isFocused ? "focused" : "initial"}
      >
        {/* Floating Label */}
        <motion.label
          className="absolute left-4 top-4 pointer-events-none font-medium"
          variants={labelVariants}
          initial="initial"
          animate={isLabelFloating ? "focused" : "initial"}
        >
          Describe the image you want to create...
        </motion.label>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={`w-full min-h-[60px] max-h-[120px] resize-none bg-transparent border-none outline-none px-4 pt-6 pb-4 text-gray-900 placeholder-transparent ${
              isLabelFloating ? 'pt-8' : 'pt-6'
            }`}
            style={{ paddingTop: isLabelFloating ? '32px' : '24px' }}
          />
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="absolute right-4 top-4 flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span className="text-xs text-blue-500 font-medium mr-2">Typing</span>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-blue-500 rounded-full"
                    variants={typingDotsVariants}
                    animate="animate"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-100">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            {/* Image Toggle */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleImageDropZone}
                disabled={disabled}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                {showImageDropZone ? (
                  <Minus className="h-4 w-4 text-blue-600" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-600" />
                )}
              </Button>
            </motion.div>

            {/* Additional Actions */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Paperclip className="h-4 w-4 text-gray-600" />
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Smile className="h-4 w-4 text-gray-600" />
              </Button>
            </motion.div>

            {/* Image Count Badge */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {images.length} image{images.length > 1 ? 's' : ''}
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Character Count */}
            <motion.span
              className={`text-xs font-medium transition-colors ${
                isOverLimit 
                  ? 'text-red-500' 
                  : isNearLimit 
                    ? 'text-yellow-600' 
                    : 'text-gray-500'
              }`}
              animate={{
                scale: isOverLimit ? [1, 1.1, 1] : 1,
                color: isOverLimit ? '#EF4444' : isNearLimit ? '#D97706' : '#6B7280'
              }}
              transition={{ duration: 0.2 }}
            >
              {characterCount}/{maxLength}
            </motion.span>

            {/* Send Button */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                onClick={handleSend}
                disabled={!value.trim() || disabled || isOverLimit}
                className={`h-10 px-4 rounded-xl transition-all duration-200 ${
                  value.trim() && !disabled && !isOverLimit
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <motion.div
                  animate={value.trim() && !disabled ? { rotate: [0, 15, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Focus Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isFocused ? 1 : 0,
            boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 0 0 0px rgba(59, 130, 246, 0)'
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Helper Text */}
      <motion.div
        className="flex items-center justify-between text-xs text-gray-500 px-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isTyping && (
            <motion.span
              className="text-blue-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              AI is preparing to respond...
            </motion.span>
          )}
        </div>
        
        {/* Shortcuts */}
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
          <span className="ml-1">to send</span>
        </div>
      </motion.div>
    </div>
  );
}