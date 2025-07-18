'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatMessage, GeneratedPrompt } from '@/types';
import { generatePrompt, handleApiError } from '@/lib/api';
import { useApiKey } from '@/hooks/useApiKey';
import { MessageRenderer } from '@/components/MessageRenderer';
import { TypingIndicator } from '@/components/LoadingStates';
import { ImageDropZone } from '@/components/ImageDropZone';
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
}

export function ChatWindow({ onPromptGenerated, className }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showImageDropZone, setShowImageDropZone] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { hasValidKey } = useApiKey();

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

    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, assistantMessage]);
      
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
      
      setMessages(prev => [...prev, errorAssistantMessage]);
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

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setImages([]);
    setShowImageDropZone(false);
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
        {/* Chat Header */}
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">AI Prompt Assistant</h3>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Welcome to AI Prompt Assistant!</p>
              <p className="text-sm">
                Describe what you want to create, and I&apos;ll help you craft the perfect prompt for AI image generation.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageRenderer key={message.id} message={message} />
            ))
          )}
          
          {isLoading && (
            <TypingIndicator />
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
      </CardContent>
    </Card>
  );
}