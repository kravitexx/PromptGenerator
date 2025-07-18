'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { getFormattedPrompt } from '@/lib/promptBuilder';
import { getAllTemplates } from '@/lib/modelTemplates';
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
  ChevronUp
} from 'lucide-react';

interface MessageRendererProps {
  message: ChatMessage;
  className?: string;
}

export function MessageRenderer({ message, className }: MessageRendererProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showScaffoldDetails, setShowScaffoldDetails] = useState(false);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-3.5');
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const renderUserMessage = () => (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] order-2">
        <div className="bg-blue-600 text-white rounded-lg p-3">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Show images if present */}
          {message.images && message.images.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">
                  {message.images.length} image{message.images.length > 1 ? 's' : ''} attached
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {message.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square rounded overflow-hidden bg-blue-500">
                    <img
                      src={`data:image/jpeg;base64,${image}`}
                      alt={`Attached image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {message.images.length > 4 && (
                  <div className="aspect-square rounded bg-blue-500 flex items-center justify-center">
                    <span className="text-sm">+{message.images.length - 4} more</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatDate(message.timestamp)}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 order-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  );

  const renderAssistantMessage = () => {
    const templates = getAllTemplates();
    const currentTemplate = templates.find(t => t.id === selectedModel);

    return (
      <div className="flex gap-3 justify-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        
        <div className="max-w-[80%] space-y-3">
          {/* Main message content */}
          <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">AI Enhanced Prompt</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleCopy(message.content, 'enhanced-prompt')}
              >
                {copiedText === 'enhanced-prompt' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Prompt data details */}
          {message.promptData && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Prompt Analysis
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {message.promptData.scaffold.filter(slot => slot.content.trim()).length}/7 slots filled
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowScaffoldDetails(!showScaffoldDetails)}
                    >
                      {showScaffoldDetails ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                {/* Scaffold slots overview */}
                <div className="grid grid-cols-7 gap-1">
                  {message.promptData.scaffold.map((slot) => (
                    <div
                      key={slot.key}
                      className={`h-2 rounded-full ${
                        slot.content.trim() ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                      title={`${slot.name}: ${slot.content.trim() ? 'Filled' : 'Empty'}`}
                    />
                  ))}
                </div>

                {/* Detailed scaffold view */}
                {showScaffoldDetails && (
                  <div className="space-y-2">
                    {message.promptData.scaffold.map((slot) => (
                      <div key={slot.key} className="flex gap-2">
                        <Badge variant="secondary" className="text-xs min-w-[2rem] justify-center">
                          {slot.key}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                              {slot.name}
                            </span>
                            {slot.content.trim() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => handleCopy(slot.content, `slot-${slot.key}`)}
                              >
                                {copiedText === `slot-${slot.key}` ? (
                                  <Check className="h-2 w-2 text-green-600" />
                                ) : (
                                  <Copy className="h-2 w-2" />
                                )}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-800 mt-1">
                            {slot.content.trim() || (
                              <span className="text-gray-400 italic">Not specified</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Model template selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Format for:
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFormattedPrompt(!showFormattedPrompt)}
                    >
                      {showFormattedPrompt ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full text-xs border rounded px-2 py-1 bg-white"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>

                  {/* Formatted prompt display */}
                  {showFormattedPrompt && currentTemplate && (
                    <div className="bg-gray-50 rounded p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Formatted for {currentTemplate.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const formatted = getFormattedPrompt(message.promptData!, selectedModel);
                            handleCopy(formatted, 'formatted-prompt');
                          }}
                        >
                          {copiedText === 'formatted-prompt' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
                        {getFormattedPrompt(message.promptData, selectedModel)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {formatDate(message.timestamp)}
            </span>
            {message.promptData && (
              <Badge variant="secondary" className="text-xs">
                v{message.promptData.metadata.version}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {message.type === 'user' ? renderUserMessage() : renderAssistantMessage()}
    </div>
  );
}