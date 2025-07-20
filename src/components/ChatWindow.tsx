'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatMessage, GeneratedPrompt } from '@/types';
import { generatePrompt, handleApiError } from '@/lib/api';
import { useApiKey } from '@/hooks/useApiKey';
import { useChatPersistence } from '@/hooks/useDrivePersistence';
import { ModernMessageBubble } from '@/components/ModernMessageBubble';
import { ModernTypingIndicator } from '@/components/ModernTypingIndicator';
import { ImageDropZone } from '@/components/ImageDropZone';
import { PromptGenerator } from '@/components/PromptGenerator';
import { DriveStatus } from '@/components/DriveStatus';
import { 
  Send, 
  Bot, 
  AlertCircle,
  Image as ImageIcon,
  Plus,
  Minus
} from 'lucide-react';

interface ChatWindowProps {
  onPromptGenerated?: (prompt: GeneratedPrompt) => void;
  className?: string;
  showPromptGenerator?: boolean;
}

export function ChatWindow({ onPromptGenerated, className, showPromptGenerator = true }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showImageDropZone, setShowImageDropZone] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { hasValidKey } = useApiKey();
  const { messages, addMessage, clearMessages, isLoading: isDriveLoading } = useChatPersistence();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !hasValidKey) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      images: images.length > 0 ? [...images] : undefined,
    };

    await addMessage(userMessage);
    setInputValue('');
    setImages([]);
    setShowImageDropZone(false);
    setIsLoading(true);
    setError(null);

    try {
      // Generate enhanced prompt using the API
      const result = await generatePrompt(userMessage.content, userMessage.images);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: result.enhancedText,
        timestamp: new Date(),
        promptData: result.generatedPrompt as GeneratedPrompt,
      };

      await addMessage(assistantMessage);
      
      // Update current prompt for the generator
      if (result.generatedPrompt) {
        setCurrentPrompt(result.generatedPrompt as GeneratedPrompt);
      }
      
      // Notify parent component about the generated prompt
      if (onPromptGenerated && result.generatedPrompt) {
        onPromptGenerated(result.generatedPrompt as GeneratedPrompt);
      }

    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      const errorAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      
      await addMessage(errorAssistantMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    await clearMessages();
    setError(null);
    setImages([]);
    setShowImageDropZone(false);
    setCurrentPrompt(null);
  };

  const handlePromptUpdate = (updatedPrompt: GeneratedPrompt) => {
    setCurrentPrompt(updatedPrompt);
    onPromptGenerated?.(updatedPrompt);
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  if (!hasValidKey) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
          <p className="text-gray-600">
            Please configure your Gemini API key to start using the chat interface.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Modern Chat Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <Bot className="h-6 w-6 text-blue-600" />
            </motion.div>
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-800">AI Prompt Assistant</h3>
              <span className="text-xs text-gray-500">Powered by Gemini AI</span>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                {messages.length} messages
              </Badge>
            </motion.div>
            {isDriveLoading && (
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [0.95, 1, 0.95]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                  Syncing...
                </Badge>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DriveStatus />
            {messages.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearChat}
                  className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                >
                  Clear Chat
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
          {messages.length === 0 ? (
            <motion.div 
              className="text-center text-gray-500 py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Bot className="h-16 w-16 mx-auto mb-6 text-blue-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-xl font-bold text-gray-700 mb-3">Welcome to AI Prompt Assistant!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Describe what you want to create, and I'll help you craft the perfect prompt for AI image generation with detailed scaffolding and optimization.
                </p>
              </motion.div>
              
              {/* Floating animation elements */}
              <div className="relative mt-8">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-300 rounded-full"
                    style={{
                      left: `${30 + i * 20}%`,
                      top: `${i * 10}px`
                    }}
                    animate={{
                      y: [-5, -15, -5],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <ModernMessageBubble 
                key={message.id} 
                message={message} 
                isLatest={index === messages.length - 1}
              />
            ))
          )}
          
          {isLoading && (
            <ModernTypingIndicator />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-white space-y-3">
          {/* Image Drop Zone */}
          {showImageDropZone && (
            <ImageDropZone
              onImagesChange={handleImagesChange}
              maxImages={3}
              disabled={isLoading}
            />
          )}

          {/* Text Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe the image you want to create..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageDropZone(!showImageDropZone)}
                disabled={isLoading}
                className="self-start"
              >
                {showImageDropZone ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {images.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {images.length} image{images.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <span>{inputValue.length}/2000</span>
          </div>
        </div>

        {/* Prompt Generator */}
        {showPromptGenerator && currentPrompt && (
          <div className="p-4 border-t bg-gray-50">
            <PromptGenerator
              prompt={currentPrompt}
              onPromptUpdate={handlePromptUpdate}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}