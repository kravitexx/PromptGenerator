'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, GeneratedPrompt, ClarifyingQuestion, ScaffoldSlot } from '@/types';
import { generatePrompt, handleApiError } from '@/lib/api';
import { useApiKey } from '@/hooks/useApiKey';
import { useChatPersistence } from '@/hooks/useLocalPersistence';
import { PromptSwitcher } from '@/components/PromptSwitcher';
import { ModernScaffoldDisplay } from '@/components/ModernScaffoldDisplay';
import { ClarifyModal } from '@/components/ClarifyModal';
import { ImageDropZone } from '@/components/ImageDropZone';
import { FormatWizard } from '@/components/FormatWizard';
import { getRelevantQuestions, processQuestionAnswers } from '@/lib/clarifyingQuestions';
import { getEmptySlots, updateScaffoldSlot } from '@/lib/scaffold';
import { updateGeneratedPrompt } from '@/lib/promptBuilder';
import { Send, User, Bot, Loader2, Image, Wand2, HelpCircle } from 'lucide-react';

interface SimpleChatWindowProps {
  onPromptGenerated?: (prompt: GeneratedPrompt) => void;
  className?: string;
  showPromptGenerator?: boolean;
}

export function SimpleChatWindow({ onPromptGenerated, className }: SimpleChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [showFormatWizard, setShowFormatWizard] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showImageDropZone, setShowImageDropZone] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { hasValidKey } = useApiKey();
  const { messages, addMessage } = useChatPersistence();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    // Allow sending if there's either text OR images
    const hasText = inputValue.trim().length > 0;
    const hasImages = images.length > 0;
    
    if ((!hasText && !hasImages) || isLoading || !hasValidKey) return;

    // Create appropriate content based on what user provided
    let messageContent = '';
    if (hasText && hasImages) {
      messageContent = inputValue.trim(); // User provided both text and images
    } else if (hasText) {
      messageContent = inputValue.trim(); // Only text
    } else if (hasImages) {
      messageContent = 'Generate a detailed prompt for this image'; // Only images
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      // Don't store images in message history to avoid localStorage quota issues
      // images: images.length > 0 ? [...images] : undefined,
    };

    await addMessage(userMessage);
    setInputValue('');
    setImages([]);
    setShowImageDropZone(false);
    setIsLoading(true);

    try {
      // Send the appropriate prompt to the API
      const promptText = hasText ? inputValue.trim() : 'Analyze this image and generate a detailed, enhanced prompt for AI image generation';
      const result = await generatePrompt(promptText, images);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: result.enhancedText,
        timestamp: new Date(),
        promptData: result.generatedPrompt as GeneratedPrompt,
      };

      await addMessage(assistantMessage);
      
      if (result.generatedPrompt) {
        const prompt = result.generatedPrompt as GeneratedPrompt;
        setCurrentPrompt(prompt);
        
        if (onPromptGenerated) {
          onPromptGenerated(prompt);
        }

        // Check if we should show clarifying questions
        const emptySlots = getEmptySlots(prompt.scaffold);
        if (emptySlots.length > 0) {
          const questions = getRelevantQuestions(emptySlots.map(slot => slot.name));
          if (questions.length > 0) {
            setClarifyingQuestions(questions);
            // Auto-show clarifying modal after a short delay
            setTimeout(() => setShowClarifyModal(true), 1000);
          }
        }
      }

    } catch (err) {
      console.error('Error generating prompt:', err);
      const errorMessage = handleApiError(err);
      
      // Provide more specific error messages
      let userFriendlyMessage = `Sorry, I encountered an error: ${errorMessage}`;
      
      if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
        userFriendlyMessage = 'The image is too large for processing. Please try a smaller image (under 5MB).';
      } else if (errorMessage.includes('API key')) {
        userFriendlyMessage = 'There seems to be an issue with your API key. Please check your Gemini API key.';
      } else if (images.length > 0) {
        userFriendlyMessage = 'Failed to process the image. Please try again with a different image or without images.';
      }
      
      const errorAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: userFriendlyMessage,
        timestamp: new Date(),
      };
      
      await addMessage(errorAssistantMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  // Image analysis functionality (currently unused but available)
  // const handleImageAnalysis = async (imageBase64: string) => {
  //   if (!currentPrompt || !hasValidKey) return;
  //   // Implementation available for future use
  // };

  const handleClarifyingAnswers = async (answers: Record<string, unknown>) => {
    if (!currentPrompt) return;

    const scaffoldUpdates = processQuestionAnswers(answers);
    let updatedScaffold = [...currentPrompt.scaffold];

    // Apply updates to scaffold
    Object.entries(scaffoldUpdates).forEach(([key, value]) => {
      if (key !== '_negative' && value) {
        updatedScaffold = updateScaffoldSlot(updatedScaffold, key as any, value);
      }
    });

    // Create updated prompt
    const updatedPrompt = updateGeneratedPrompt(currentPrompt, updatedScaffold);
    setCurrentPrompt(updatedPrompt);

    // Add a message showing the improvements
    const improvementMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'assistant',
      content: 'Great! I\'ve updated your prompt based on your answers. Here\'s the improved version:',
      timestamp: new Date(),
      promptData: updatedPrompt,
    };

    await addMessage(improvementMessage);

    if (onPromptGenerated) {
      onPromptGenerated(updatedPrompt);
    }
  };

  const handleScaffoldUpdate = async (updatedScaffold: ScaffoldSlot[]) => {
    if (!currentPrompt) return;

    const updatedPrompt = updateGeneratedPrompt(currentPrompt, updatedScaffold);
    setCurrentPrompt(updatedPrompt);

    if (onPromptGenerated) {
      onPromptGenerated(updatedPrompt);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only send if there's text OR images
      if (inputValue.trim() || images.length > 0) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What can I help with?
              </h2>
              <p className="text-gray-600">
                Generate prompts from text, images, or both
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {message.type === 'user' ? (
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.promptData && message.promptData.scaffold && (
                      <div className="mt-4 space-y-4">
                        {/* Scaffold Display */}
                        <ModernScaffoldDisplay 
                          prompt={message.promptData}
                          onScaffoldUpdate={handleScaffoldUpdate}
                          editable={true}
                          variant="compact"
                        />
                        
                        {/* Model Template Switcher */}
                        <PromptSwitcher 
                          prompt={message.promptData}
                          onTemplateChange={() => {}}
                        />
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const emptySlots = getEmptySlots(message.promptData!.scaffold);
                              if (emptySlots.length > 0) {
                                const questions = getRelevantQuestions(emptySlots.map(slot => slot.name));
                                setClarifyingQuestions(questions);
                                setShowClarifyModal(true);
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <HelpCircle className="h-3 w-3" />
                            Improve Prompt
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImageDropZone(!showImageDropZone)}
                            className="flex items-center gap-1"
                          >
                            <Image className="h-3 w-3" />
                            Analyze Image
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFormatWizard(true)}
                            className="flex items-center gap-1"
                          >
                            <Wand2 className="h-3 w-3" />
                            Custom Format
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating prompt...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Image Drop Zone */}
          {showImageDropZone && (
            <div className="mb-4">
              <ImageDropZone
                onImagesChange={handleImagesChange}
                maxImages={3}
                className="mb-4"
              />
            </div>
          )}
          
          <div className="relative">
            {/* Image indicator */}
            {images.length > 0 && (
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
                <Image className="h-4 w-4" />
                <span>{images.length} image{images.length > 1 ? 's' : ''} ready to send</span>
              </div>
            )}
            
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={images.length > 0 ? "Add details about the image (optional)..." : "Ask anything or upload images..."}
              className="min-h-[60px] max-h-[200px] pr-12 resize-none border-gray-300 focus:border-gray-400 focus:ring-0"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageDropZone(!showImageDropZone)}
                className="h-8 w-8 p-0"
                title="Add images"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && images.length === 0) || isLoading}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClarifyModal
        isOpen={showClarifyModal}
        onClose={() => setShowClarifyModal(false)}
        questions={clarifyingQuestions}
        onAnswersSubmit={handleClarifyingAnswers}
      />

      <FormatWizard
        isOpen={showFormatWizard}
        onClose={() => setShowFormatWizard(false)}
        onSave={async (format) => {
          // Handle custom format save using localStorage
          try {
            const { saveCustomFormat } = await import('@/lib/customFormats');
            saveCustomFormat(format);
            setShowFormatWizard(false);
          } catch (error) {
            console.error('Failed to save custom format:', error);
          }
        }}
      />
    </div>
  );
}