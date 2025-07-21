'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveButton, InteractiveInput, InteractiveTextarea } from '@/components/MicroInteractions';
import { StateTransition } from '@/components/StateTransitions';
import { GeneratedPrompt, ScaffoldSlot } from '@/types';
import { ModernPromptCard } from '@/components/ModernPromptCard';
import { ModernScaffoldDisplay } from '@/components/ModernScaffoldDisplay';
import { PromptSwitcher } from '@/components/PromptSwitcher';
import { PromptImprover } from '@/components/PromptImprover';
import { ImageFeedbackAnalyzer } from '@/components/ImageFeedbackAnalyzer';
import { updateGeneratedPrompt } from '@/lib/promptBuilder';
import { formatDate } from '@/lib/utils';
import { ResponsiveContainer, ResponsiveFlex, PromptCardGrid } from '@/components/ResponsiveGrid';
import { 
  Wand2, 
  RefreshCw, 
  Download,
  Share2,
  Sparkles
} from 'lucide-react';

interface PromptGeneratorProps {
  prompt: GeneratedPrompt;
  onPromptUpdate?: (updatedPrompt: GeneratedPrompt) => void;
  className?: string;
}

export function PromptGenerator({ 
  prompt, 
  onPromptUpdate, 
  className 
}: PromptGeneratorProps) {
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt>(prompt);
  const [selectedTemplateId, setSelectedTemplateId] = useState('stable-diffusion-3.5');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentPrompt(prompt);
  }, [prompt]);

  const handleScaffoldUpdate = (updatedScaffold: ScaffoldSlot[]) => {
    try {
      const updatedPrompt = updateGeneratedPrompt(currentPrompt, updatedScaffold);
      setCurrentPrompt(updatedPrompt);
      onPromptUpdate?.(updatedPrompt);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  const handlePromptImprovement = (updatedPrompt: GeneratedPrompt) => {
    setCurrentPrompt(updatedPrompt);
    onPromptUpdate?.(updatedPrompt);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleRegeneratePrompt = async () => {
    setIsRegenerating(true);
    try {
      // In a real implementation, this would call the API to regenerate
      // For now, we'll just trigger a re-analysis of the current content
      const scaffoldContent = currentPrompt.scaffold
        .filter(slot => slot.content.trim())
        .map(slot => slot.content)
        .join(' ');
      
      // Simulate regeneration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // The actual regeneration would happen via API call
      console.log('Regenerating prompt with content:', scaffoldContent);
      
    } catch (err) {
      console.error('Failed to regenerate prompt:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPrompt = () => {
    const exportData = {
      id: currentPrompt.id,
      scaffold: currentPrompt.scaffold,
      formattedOutputs: currentPrompt.formattedOutputs,
      metadata: currentPrompt.metadata,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${currentPrompt.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSharePrompt = async () => {
    const shareText = currentPrompt.formattedOutputs[selectedTemplateId] || 
                     currentPrompt.rawText;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Prompt',
          text: shareText,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const getCompletionStats = () => {
    const filledSlots = currentPrompt.scaffold.filter(slot => slot.content.trim());
    const totalSlots = currentPrompt.scaffold.length;
    const percentage = Math.round((filledSlots.length / totalSlots) * 100);
    
    return {
      filled: filledSlots.length,
      total: totalSlots,
      percentage,
    };
  };

  const stats = getCompletionStats();

  return (
    <ResponsiveContainer maxWidth="full" className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header with Stats and Actions */}
      <Card>
        <CardHeader>
          <ResponsiveFlex 
            justify="between" 
            align="center" 
            responsive={true}
            gap="gap-4"
            className="flex-col sm:flex-row"
          >
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Wand2 className="h-5 w-5" />
              Prompt Generator
            </CardTitle>
            <ResponsiveFlex 
              align="center" 
              gap="gap-2" 
              responsive={false}
              className="flex-wrap justify-center sm:justify-end"
            >
              <Badge variant={stats.percentage === 100 ? 'default' : 'secondary'}>
                <Sparkles className="h-3 w-3 mr-1" />
                {stats.percentage}% Complete
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegeneratePrompt}
                disabled={isRegenerating}
                className="text-xs sm:text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                <span className="sm:hidden">Regen</span>
              </Button>
            </ResponsiveFlex>
          </ResponsiveFlex>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Created:</span>{' '}
                {formatDate(currentPrompt.metadata.createdAt)}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Version:</span>{' '}
                {currentPrompt.metadata.version}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSharePrompt}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPrompt}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scaffold Display */}
      <ScaffoldDisplay
        prompt={currentPrompt}
        onScaffoldUpdate={handleScaffoldUpdate}
        editable={true}
      />

      {/* Prompt Improver */}
      <PromptImprover
        prompt={currentPrompt}
        onPromptUpdate={handlePromptImprovement}
      />

      {/* Template Switcher */}
      <PromptSwitcher
        prompt={currentPrompt}
        onTemplateChange={handleTemplateChange}
      />

      {/* Image Feedback Analyzer */}
      <ImageFeedbackAnalyzer
        prompt={currentPrompt}
        onFeedbackReceived={(feedback) => {
          console.log('Feedback received:', feedback);
        }}
      />

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.filled}
              </div>
              <div className="text-xs text-gray-600">Slots Filled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(currentPrompt.formattedOutputs).length}
              </div>
              <div className="text-xs text-gray-600">Model Formats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {currentPrompt.rawText.split(' ').length}
              </div>
              <div className="text-xs text-gray-600">Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {currentPrompt.metadata.version}
              </div>
              <div className="text-xs text-gray-600">Version</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}