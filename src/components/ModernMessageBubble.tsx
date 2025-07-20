'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { getFormattedPrompt } from '@/lib/promptBuilder';
import { getAllTemplates } from '@/lib/modelTemplates';
import { AnimatedChatMessage } from '@/components/ComponentTransitions';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Image as ImageIcon,
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ModernMessageBubbleProps {
  message: ChatMessage;
  className?: string;
  isLatest?: boolean;
}

// Message status types
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';

// Animation variants for message bubbles
const bubbleVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: 'tween'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Typing animation for text content
const textVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: 0.2
    }
  }
};

// Status indicator animations
const statusVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

export function ModernMessageBubble({ message, className, isLatest = false }: ModernMessageBubbleProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showScaffoldDetails, setShowScaffoldDetails] = useState(false);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-3.5');
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(false);
  const [messageStatus, setMessageStatus] = useState<MessageStatus>('sent');
  const [isHovered, setIsHovered] = useState(false);

  // Simulate message status progression for demo
  useEffect(() => {
    if (isLatest && message.type === 'user') {
      setMessageStatus('sending');
      const timer1 = setTimeout(() => setMessageStatus('sent'), 500);
      const timer2 = setTimeout(() => setMessageStatus('delivered'), 1000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isLatest, message.type]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const renderUserMessage = () => (
    <motion.div 
      className="flex gap-3 justify-end group"
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="max-w-[80%] order-2">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Modern gradient bubble */}
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md p-4 shadow-lg relative overflow-hidden">
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
              animate={{
                x: isHovered ? ['-100%', '100%'] : '-100%'
              }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut'
              }}
            />
            
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            
            <motion.div 
              className="relative z-10"
              variants={textVariants}
              initial="initial"
              animate="animate"
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
              
              {/* Enhanced image display */}
              {message.images && message.images.length > 0 && (
                <motion.div 
                  className="mt-4 pt-4 border-t border-white/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </motion.div>
                    <span className="text-sm font-medium">
                      {message.images.length} image{message.images.length > 1 ? 's' : ''} attached
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {message.images.slice(0, 4).map((image, index) => (
                      <motion.div 
                        key={index} 
                        className="aspect-square rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={`data:image/jpeg;base64,${image}`}
                          alt={`Attached image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                    {message.images.length > 4 && (
                      <motion.div 
                        className="aspect-square rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <span className="text-sm font-medium">+{message.images.length - 4}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Message tail */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-600 to-purple-600 transform rotate-45" />
        </motion.div>
        
        {/* Message metadata */}
        <motion.div 
          className="flex items-center justify-end gap-2 mt-2 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={messageStatus}
              variants={statusVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {getStatusIcon(messageStatus)}
            </motion.div>
          </AnimatePresence>
          <span className="text-xs text-gray-500 font-medium">
            {formatDate(message.timestamp)}
          </span>
        </motion.div>
      </div>

      {/* Enhanced user avatar */}
      <motion.div 
        className="flex-shrink-0 order-3"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
          <User className="h-5 w-5 text-gray-600" />
        </div>
      </motion.div>
    </motion.div>
  );

  const renderAssistantMessage = () => {
    const templates = getAllTemplates();
    const currentTemplate = templates.find(t => t.id === selectedModel);

    return (
      <motion.div 
        className="flex gap-3 justify-start group"
        variants={bubbleVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Enhanced bot avatar */}
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Bot className="h-5 w-5 text-blue-600" />
            </motion.div>
          </div>
        </motion.div>
        
        <div className="max-w-[80%] space-y-3">
          {/* Main message bubble */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-2xl rounded-bl-md p-4 shadow-lg border border-gray-200/50 relative overflow-hidden">
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: isHovered ? ['-100%', '100%'] : '-100%'
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut'
                }}
              />
              
              <motion.div 
                className="relative z-10"
                variants={textVariants}
                initial="initial"
                animate="animate"
              >
                <p className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
                
                <motion.div 
                  className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/70"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </motion.div>
                    <span className="text-sm font-semibold text-gray-700">AI Enhanced Prompt</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      onClick={() => handleCopy(message.content, 'enhanced-prompt')}
                    >
                      <AnimatePresence mode="wait">
                        {copiedText === 'enhanced-prompt' ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Message tail */}
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 transform rotate-45 border-r border-b border-gray-200/50" />
          </motion.div>

          {/* Enhanced prompt data details */}
          {message.promptData && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Card className="border-l-4 border-l-blue-500 shadow-md bg-gradient-to-r from-blue-50/50 to-transparent">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4 text-blue-600" />
                        </motion.div>
                        Prompt Analysis
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                            {message.promptData.scaffold.filter(slot => slot.content.trim()).length}/7 slots filled
                          </Badge>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowScaffoldDetails(!showScaffoldDetails)}
                            className="hover:bg-blue-100"
                          >
                            <motion.div
                              animate={{ rotate: showScaffoldDetails ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    {/* Enhanced scaffold slots overview */}
                    <div className="grid grid-cols-7 gap-2">
                      {message.promptData.scaffold.map((slot, index) => (
                        <motion.div
                          key={slot.key}
                          className={`h-3 rounded-full transition-all duration-300 ${
                            slot.content.trim() 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm' 
                              : 'bg-gray-200'
                          }`}
                          title={`${slot.name}: ${slot.content.trim() ? 'Filled' : 'Empty'}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          whileHover={{ scale: 1.2, y: -2 }}
                        />
                      ))}
                    </div>

                    {/* Detailed scaffold view with animations */}
                    <AnimatePresence>
                      {showScaffoldDetails && (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {message.promptData.scaffold.map((slot, index) => (
                            <motion.div 
                              key={slot.key} 
                              className="flex gap-3 p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Badge variant="secondary" className="text-xs min-w-[2.5rem] justify-center bg-blue-100 text-blue-700">
                                  {slot.key}
                                </Badge>
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-gray-700">
                                    {slot.name}
                                  </span>
                                  {slot.content.trim() && (
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-blue-100"
                                        onClick={() => handleCopy(slot.content, `slot-${slot.key}`)}
                                      >
                                        <AnimatePresence mode="wait">
                                          {copiedText === `slot-${slot.key}` ? (
                                            <motion.div
                                              key="check"
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              exit={{ scale: 0 }}
                                            >
                                              <Check className="h-3 w-3 text-green-600" />
                                            </motion.div>
                                          ) : (
                                            <motion.div
                                              key="copy"
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              exit={{ scale: 0 }}
                                            >
                                              <Copy className="h-3 w-3" />
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </Button>
                                    </motion.div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-800 mt-1 leading-relaxed">
                                  {slot.content.trim() || (
                                    <span className="text-gray-400 italic">Not specified</span>
                                  )}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Enhanced model template selector */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-700">
                          Format for:
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFormattedPrompt(!showFormattedPrompt)}
                            className="hover:bg-blue-100"
                          >
                            <motion.div
                              animate={{ rotate: showFormattedPrompt ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {showFormattedPrompt ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </motion.div>
                          </Button>
                        </motion.div>
                      </div>
                      
                      <motion.select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        whileFocus={{ scale: 1.02 }}
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </motion.select>

                      {/* Enhanced formatted prompt display */}
                      <AnimatePresence>
                        {showFormattedPrompt && currentTemplate && (
                          <motion.div 
                            className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg p-3 space-y-2 border border-gray-200"
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-700">
                                Formatted for {currentTemplate.name}
                              </span>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  onClick={() => {
                                    const formatted = getFormattedPrompt(message.promptData!, selectedModel);
                                    handleCopy(formatted, 'formatted-prompt');
                                  }}
                                >
                                  <AnimatePresence mode="wait">
                                    {copiedText === 'formatted-prompt' ? (
                                      <motion.div
                                        key="check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                      >
                                        <Check className="h-3 w-3 text-green-600" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="copy"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Button>
                              </motion.div>
                            </div>
                            <motion.p 
                              className="text-xs text-gray-800 font-mono whitespace-pre-wrap leading-relaxed bg-white/50 p-2 rounded border"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {getFormattedPrompt(message.promptData, selectedModel)}
                            </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Message metadata */}
          <motion.div 
            className="flex items-center gap-3 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-xs text-gray-500 font-medium">
              {formatDate(message.timestamp)}
            </span>
            {message.promptData && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  v{message.promptData.metadata.version}
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatedChatMessage className={className}>
      {message.type === 'user' ? renderUserMessage() : renderAssistantMessage()}
    </AnimatedChatMessage>
  );
}