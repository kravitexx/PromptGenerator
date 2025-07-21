'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useGestures, useSwipeNavigation, usePullToRefresh } from '@/hooks/useGestures';
import { ModernMessageBubble } from './ModernMessageBubble';
import { ModernChatInput } from './ModernChatInput';
import { ModernTypingIndicator } from './ModernTypingIndicator';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Copy,
  Share
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface GestureChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onRefresh?: () => void;
  onClearChat?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function GestureChatWindow({
  messages,
  onSendMessage,
  onRefresh,
  onClearChat,
  isLoading = false,
  className = ''
}: GestureChatWindowProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Pull to refresh functionality
  const pullToRefresh = usePullToRefresh(() => {
    if (onRefresh) {
      onRefresh();
    }
  });

  // Swipe navigation for message history
  const swipeNavigation = useSwipeNavigation(
    () => {
      // Swipe left - could navigate to next conversation
      console.log('Swipe left - next conversation');
    },
    () => {
      // Swipe right - could navigate to previous conversation
      console.log('Swipe right - previous conversation');
    }
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message long press for actions
  const handleMessageLongPress = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowActions(true);
    
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Handle message tap
  const handleMessageTap = (messageId: string) => {
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
      setShowActions(false);
    }
  };

  // Handle message swipe actions
  const handleMessageSwipe = (messageId: string, direction: 'left' | 'right') => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    if (direction === 'left') {
      // Copy message
      navigator.clipboard.writeText(message.content);
      
      // Show feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } else if (direction === 'right') {
      // Share message
      if (navigator.share) {
        navigator.share({
          text: message.content,
          title: 'Shared from Prompt Generator'
        });
      }
    }
  };

  // Message action handlers
  const handleCopyMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
    setShowActions(false);
    setSelectedMessageId(null);
  };

  const handleShareMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && navigator.share) {
      navigator.share({
        text: message.content,
        title: 'Shared from Prompt Generator'
      });
    }
    setShowActions(false);
    setSelectedMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    // Implementation would depend on your message management system
    console.log('Delete message:', messageId);
    setShowActions(false);
    setSelectedMessageId(null);
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30 ${className}`}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {pullToRefresh.isPulling && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-4 bg-blue-50 border-b"
          >
            <motion.div
              animate={{ rotate: pullToRefresh.pullProgress * 360 }}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span className="text-sm text-blue-600">
              {pullToRefresh.pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages */}
      <div
        ref={pullToRefresh.ref}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          transform: pullToRefresh.isPulling ? `translateY(${pullToRefresh.pullDistance * 0.5}px)` : undefined
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageWithGestures
              key={message.id}
              message={message}
              isSelected={selectedMessageId === message.id}
              onTap={() => handleMessageTap(message.id)}
              onLongPress={() => handleMessageLongPress(message.id)}
              onSwipe={(direction) => handleMessageSwipe(message.id, direction)}
              index={index}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ModernTypingIndicator />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message actions overlay */}
      <AnimatePresence>
        {showActions && selectedMessageId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setShowActions(false);
              setSelectedMessageId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleCopyMessage(selectedMessageId)}
                >
                  <Copy className="h-5 w-5" />
                  <span className="text-xs">Copy</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShareMessage(selectedMessageId)}
                >
                  <Share className="h-5 w-5" />
                  <span className="text-xs">Share</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto py-4 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteMessage(selectedMessageId)}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-xs">Delete</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat input */}
      <div className="border-t bg-white/80 backdrop-blur-sm">
        <ModernChatInput
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}

// Individual message component with gesture support
interface MessageWithGesturesProps {
  message: Message;
  isSelected: boolean;
  onTap: () => void;
  onLongPress: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  index: number;
}

function MessageWithGestures({
  message,
  isSelected,
  onTap,
  onLongPress,
  onSwipe,
  index
}: MessageWithGesturesProps) {
  const [dragX, setDragX] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const gestures = useGestures({
    onTap,
    onLongPress,
    onSwipeLeft: () => onSwipe('left'),
    onSwipeRight: () => onSwipe('right'),
    threshold: 80
  });

  const handleDrag = (event: any, info: PanInfo) => {
    setDragX(info.offset.x);
    
    // Show hint when dragging
    if (Math.abs(info.offset.x) > 40) {
      setShowSwipeHint(true);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 80;
    
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
    
    setDragX(0);
    setShowSwipeHint(false);
  };

  return (
    <motion.div
      ref={gestures.ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      {/* Swipe hint background */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-between px-4 rounded-lg"
          >
            <div className={`flex items-center gap-2 ${dragX > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </div>
            <div className={`flex items-center gap-2 ${dragX < 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className="text-sm">Copy</span>
              <Copy className="h-4 w-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message bubble */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        className={`transition-all duration-200 ${isSelected ? 'scale-105 shadow-lg' : ''}`}
      >
        <ModernMessageBubble
          message={message.content}
          isUser={message.isUser}
          timestamp={message.timestamp}
          className={isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        />
      </motion.div>
    </motion.div>
  );
}