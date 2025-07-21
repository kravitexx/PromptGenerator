'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useGestures, useSwipeNavigation } from '@/hooks/useGestures';
import { ModernPromptCard } from './ModernPromptCard';
import { ModernScaffoldDisplay } from './ModernScaffoldDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Shuffle,
  Bookmark,
  Share,
  Download
} from 'lucide-react';

interface PromptData {
  id: string;
  rawText: string;
  formattedOutputs: {
    [key: string]: string;
  };
  scaffold?: any;
}

interface GesturePromptGeneratorProps {
  prompts: PromptData[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onPromptUpdate: (prompt: PromptData) => void;
  onGenerateNew: () => void;
  onSavePrompt: (prompt: PromptData) => void;
  className?: string;
}

export function GesturePromptGenerator({
  prompts,
  currentIndex,
  onIndexChange,
  onPromptUpdate,
  onGenerateNew,
  onSavePrompt,
  className = ''
}: GesturePromptGeneratorProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const currentPrompt = prompts[currentIndex];
  const hasNext = currentIndex < prompts.length - 1;
  const hasPrevious = currentIndex > 0;

  // Swipe navigation
  const swipeNavigation = useSwipeNavigation(
    () => {
      if (hasNext) {
        onIndexChange(currentIndex + 1);
      }
    },
    () => {
      if (hasPrevious) {
        onIndexChange(currentIndex - 1);
      }
    }
  );

  // Handle card drag
  const handleDrag = (event: any, info: PanInfo) => {
    setDragOffset(info.offset.x);
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    
    if (info.offset.x > threshold || velocity > 500) {
      // Swipe right - previous
      if (hasPrevious) {
        onIndexChange(currentIndex - 1);
      }
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swipe left - next
      if (hasNext) {
        onIndexChange(currentIndex + 1);
      }
    }
    
    setDragOffset(0);
    setIsDragging(false);
  };

  // Handle double tap for actions
  const handleDoubleTap = () => {
    setShowActions(!showActions);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  // Action handlers
  const handleSave = () => {
    if (currentPrompt) {
      onSavePrompt(currentPrompt);
    }
    setShowActions(false);
  };

  const handleShare = async () => {
    if (currentPrompt && navigator.share) {
      try {
        await navigator.share({
          title: 'AI Prompt',
          text: currentPrompt.rawText,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(currentPrompt.rawText);
      }
    }
    setShowActions(false);
  };

  const handleDownload = () => {
    if (currentPrompt) {
      const blob = new Blob([currentPrompt.rawText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-${currentPrompt.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setShowActions(false);
  };

  return (
    <div className={`relative h-full overflow-hidden ${className}`}>
      {/* Navigation indicators */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-medium text-gray-600">
            {currentIndex + 1} of {prompts.length}
          </span>
          <div className="flex gap-1">
            {prompts.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <AnimatePresence>
        {!isDragging && (
          <>
            {hasPrevious && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                onClick={() => onIndexChange(currentIndex - 1)}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </motion.button>
            )}
            
            {hasNext && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                onClick={() => onIndexChange(currentIndex + 1)}
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </motion.button>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Prompt cards container */}
      <div className="relative h-full">
        <AnimatePresence mode="wait">
          {currentPrompt && (
            <motion.div
              key={currentPrompt.id}
              ref={swipeNavigation.ref}
              drag="x"
              dragConstraints={{ left: -200, right: 200 }}
              dragElastic={0.2}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: dragOffset
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 p-4"
            >
              <div className="h-full overflow-y-auto space-y-6">
                {/* Main prompt card */}
                <motion.div
                  animate={{ 
                    scale: isDragging ? 0.95 : 1,
                    rotateY: dragOffset * 0.1
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <ModernPromptCard
                    prompt={currentPrompt}
                    onPromptUpdate={onPromptUpdate}
                    variant="default"
                    showActions={true}
                    onDoubleTap={handleDoubleTap}
                  />
                </motion.div>

                {/* Scaffold display */}
                {currentPrompt.scaffold && (
                  <motion.div
                    animate={{ 
                      scale: isDragging ? 0.95 : 1,
                      opacity: isDragging ? 0.7 : 1
                    }}
                  >
                    <ModernScaffoldDisplay
                      prompt={currentPrompt}
                      onScaffoldUpdate={(updatedPrompt) => onPromptUpdate(updatedPrompt)}
                      editable={true}
                      variant="compact"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe hints */}
        <AnimatePresence>
          {isDragging && (
            <>
              {dragOffset > 50 && hasPrevious && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  Previous
                </motion.div>
              )}
              
              {dragOffset < -50 && hasNext && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  Next
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Action menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setShowActions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                  onClick={handleSave}
                >
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                  onClick={onGenerateNew}
                >
                  <Shuffle className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowActions(false)}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom toolbar */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateNew}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                New
              </Button>
              
              <div className="text-xs text-gray-500">
                Swipe to navigate • Double tap for actions
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(true)}
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}