'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { GeneratedPrompt } from '@/types';
import { getAllTemplates, getTemplate } from '@/lib/modelTemplates';
import { getFormattedPrompt } from '@/lib/promptBuilder';
import { Copy, Check, Settings } from 'lucide-react';

interface PromptSwitcherProps {
  prompt: GeneratedPrompt;
  onTemplateChange?: (templateId: string) => void;
  className?: string;
}

export function PromptSwitcher({ 
  prompt, 
  onTemplateChange, 
  className 
}: PromptSwitcherProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('stable-diffusion-3.5');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [negativePrompt, setNegativePrompt] = useState('');
  
  const templates = getAllTemplates();
  const selectedTemplate = getTemplate(selectedTemplateId);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    onTemplateChange?.(templateId);
  };

  const handleCopyPrompt = async (templateId: string) => {
    try {
      const formattedPrompt = getFormattedPrompt(prompt, templateId, negativePrompt);
      await navigator.clipboard.writeText(formattedPrompt);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const getFormattedPromptSafe = (templateId: string): string => {
    try {
      return getFormattedPrompt(prompt, templateId, negativePrompt);
    } catch (error) {
      return 'Error formatting prompt';
    }
  };

  if (!selectedTemplate) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No template selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Model Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select AI Model:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplateId === template.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTemplateSelect(template.id)}
                className="justify-start text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {template.id.replace('-', ' ').toUpperCase()}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Negative Prompt Input (if supported) */}
        {selectedTemplate.negativeFormat && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Negative Prompt (Optional):
            </label>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Things to avoid in the image..."
              className="min-h-[60px]"
            />
          </div>
        )}

        {/* Formatted Prompt Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Formatted Prompt for {selectedTemplate.name}:
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyPrompt(selectedTemplateId)}
              className="flex items-center gap-1"
            >
              {copiedTemplate === selectedTemplateId ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
          
          <div className="relative">
            <Textarea
              value={getFormattedPromptSafe(selectedTemplateId)}
              readOnly
              className="min-h-[100px] font-mono text-sm bg-gray-50"
            />
          </div>
        </div>

        {/* Model Parameters */}
        {selectedTemplate.parameters && Object.keys(selectedTemplate.parameters).length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recommended Parameters:</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedTemplate.parameters).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Copy All Templates */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Quick Copy All Formats:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {templates.map((template) => (
              <Button
                key={`copy-${template.id}`}
                variant="outline"
                size="sm"
                onClick={() => handleCopyPrompt(template.id)}
                className="text-xs"
              >
                {copiedTemplate === template.id ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                {template.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}