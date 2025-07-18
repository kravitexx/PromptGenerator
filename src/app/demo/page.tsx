'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GeneratedPrompt } from '@/types';
import { PromptGenerator } from '@/components/PromptGenerator';
import { analyzeInputAndPopulateScaffold, createGeneratedPrompt } from '@/lib/promptBuilder';
import { shouldShowClarifyingQuestions } from '@/lib/promptAnalysis';
import { Wand2, Sparkles } from 'lucide-react';

export default function DemoPage() {
  const [inputText, setInputText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePrompt = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Analyze input and create prompt
      const scaffold = analyzeInputAndPopulateScaffold(inputText);
      const prompt = createGeneratedPrompt(scaffold, inputText);
      
      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error('Failed to generate prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptUpdate = (updatedPrompt: GeneratedPrompt) => {
    setGeneratedPrompt(updatedPrompt);
  };

  const examplePrompts = [
    'A majestic dragon flying over a medieval castle at sunset',
    'A cyberpunk street scene with neon lights and rain',
    'A peaceful forest clearing with sunlight filtering through trees',
    'A vintage car parked in front of a 1950s diner',
    'An astronaut floating in space with Earth in the background'
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Prompt Generator Demo
        </h1>
        <p className="text-gray-600">
          Test the prompt generation and formatting functionality with the 7-slot scaffold system.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Generate Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe your image idea:
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your image description here..."
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleGeneratePrompt}
              disabled={!inputText.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Prompt
                </>
              )}
            </Button>

            {/* Example Prompts */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Try these examples:</label>
              <div className="space-y-1">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputText(example)}
                    className="w-full text-left justify-start h-auto p-2 text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">Original Input:</p>
                  <p className="text-sm text-gray-700">{generatedPrompt.rawText}</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">Scaffold Analysis:</p>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {generatedPrompt.scaffold.map((slot) => (
                      <div
                        key={slot.key}
                        className={`h-3 rounded ${
                          slot.content.trim() ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                        title={`${slot.name}: ${slot.content.trim() ? 'Filled' : 'Empty'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    {generatedPrompt.scaffold.filter(slot => slot.content.trim()).length}/7 slots populated
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">Available Formats:</p>
                  <p className="text-xs text-gray-600">
                    {Object.keys(generatedPrompt.formattedOutputs).length} model templates ready
                  </p>
                </div>

                <div className={`p-3 rounded ${shouldShowClarifyingQuestions(generatedPrompt) ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className="text-sm font-medium mb-1">
                    {shouldShowClarifyingQuestions(generatedPrompt) ? 'Improvement Available' : 'Quality Check'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {shouldShowClarifyingQuestions(generatedPrompt) 
                      ? 'Clarifying questions available to improve this prompt'
                      : 'Prompt quality looks good'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wand2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter a description and click &quot;Generate Prompt&quot; to see the results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prompt Generator Component */}
      {generatedPrompt && (
        <div className="mt-8">
          <PromptGenerator
            prompt={generatedPrompt}
            onPromptUpdate={handlePromptUpdate}
          />
        </div>
      )}
    </div>
  );
}