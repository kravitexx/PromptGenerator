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
  MicOff,
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
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  focused: { 
    scale: 1.02,
    boxShadow: '0 4px 12px 0 rgba(59, 130, 246, 0.15)',
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
    color: '#6B7280'
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
  const [isRecording, setIsRecording] = useState(false);
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canSend = value.trim().length > 0 && !disabled;

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

      {/* Attached Images Preview */}
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
                    alt={`Attached image ${index + 1}`}
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
        className="relative"
        variants={inputContainerVariants}
        initial="initial"
        animate={isFocused ? "focused" : "initial"}
      >
        <div className="glass-card p-4 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm">
          {/* Floating Label */}
          <AnimatePresence>
            {!isFocused && !value && (
              <motion.label
                className="absolute left-6 top-6 text-gray-500 pointer-events-none select-none"
                variants={labelVariants}
                initial="initial"
                animate={isFocused || value ? "focused" : "initial"}
                exit="focused"
              >
                Describe the image you want to create...
              </motion.label>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="flex gap-3">
            {/* Textarea Container */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyPress}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                maxLength={maxLength}
                className="w-full min-h-[60px] max-h-[120px] resize-none bg-transparent border-none outline-none text-gray-900 placeholder-transparent leading-relaxed"
                style={{ paddingTop: isFocused || value ? '8px' : '20px' }}
              />
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="absolute bottom-2 left-2 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <span className="text-xs text-blue-600 font-medium">Typing</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 bg-blue-500 rounded-full"
                          variants={typingDotsVariants}
                          animate="animate"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Attachment Button */}
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
                  className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  {showImageDropZone ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>

              {/* Voice Recording Button */}
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  disabled={disabled}
                  className={`h-10 w-10 p-0 transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <motion.div
                    animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>

              {/* Send Button */}
              <motion.div
                variants={buttonVariants}
                whileHover={canSend ? "hover" : "initial"}
                whileTap={canSend ? "tap" : "initial"}
              >
                <Button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`h-10 w-10 p-0 transition-all duration-300 ${
                    canSend
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={canSend ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Input Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {images.length} image{images.length > 1 ? 's' : ''}
                  </Badge>
                </motion.div>
              )}
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-red-600"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                  <span>Recording...</span>
                </motion.div>
              )}
            </div>
            
            {/* Character Count */}
            <motion.div
              className={`text-xs transition-colors ${
                value.length > maxLength * 0.9 
                  ? 'text-red-500' 
                  : value.length > maxLength * 0.7 
                    ? 'text-yellow-500' 
                    : 'text-gray-500'
              }`}
              animate={value.length > maxLength * 0.9 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {value.length}/{maxLength}
            </motion.div>
          </div>
        </div>

        {/* Focus Ring */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-blue-500 pointer-events-none"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Shimmer Effect on Hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}