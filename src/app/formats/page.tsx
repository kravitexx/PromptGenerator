'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomFormat, GeneratedPrompt } from '@/types';
import { CustomFormatManager } from '@/components/CustomFormatManager';
import { PromptSwitcher } from '@/components/PromptSwitcher';
import { analyzeInputAndPopulateScaffold, createGeneratedPrompt } from '@/lib/promptBuilder';
import { formatPromptWithCustomFormat } from '@/lib/customFormats';
import { scaffoldToObject } from '@/lib/scaffold';
import { 
  Wand2, 
  Sparkles, 
  Eye,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function CustomFormatsPage() {
  const [selectedFormat, setSelectedFormat] = useState<CustomFormat | null>(null);
  const [testPrompt, setTestPrompt] = useState<GeneratedPrompt | null>(null);

  // Create a sample prompt for testing
  const createSamplePrompt = () => {
    const sampleInput = 'A majestic dragon flying over a medieval castle at sunset with dramatic lighting';
    const scaffold = analyzeInputAndPopulateScaffold(sampleInput);
    const prompt = createGeneratedPrompt(scaffold, sampleInput);
    setTestPrompt(prompt);
  };

  const handleFormatSelect = (format: CustomFormat) => {
    setSelectedFormat(format);
    if (!testPrompt) {
      createSamplePrompt();
    }
  };

  const getFormattedPreview = () => {
    if (!selectedFormat || !testPrompt) return '';
    
    try {
      const scaffoldObject = scaffoldToObject(testPrompt.scaffold);
      return formatPromptWithCustomFormat(scaffoldObject, selectedFormat);
    } catch (error) {
      return 'Error formatting prompt';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/demo">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Demo
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wand2 className="h-8 w-8 text-purple-600" />
              Custom Format Manager
            </h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage custom prompt formats for specialized AI image generation models.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Format Manager */}
        <div className="space-y-6">
          <CustomFormatManager
            onFormatSelect={handleFormatSelect}
            selectedFormatId={selectedFormat?.id}
          />

          {/* Format Details */}
          {selectedFormat && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Format Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Name:</span>
                  <span className="ml-2 text-sm">{selectedFormat.name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Template:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-xs break-all">
                    {selectedFormat.template}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Tokens Used:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedFormat.slots.map((slot) => (
                      <span 
                        key={slot.key}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                      >
                        {`{${slot.key}}`} - {slot.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Format Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!testPrompt ? (
                <div className="text-center py-8">
                  <Button onClick={createSamplePrompt}>
                    Generate Sample Prompt
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Create a sample prompt to test your custom formats
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Sample Input:</span>
                    <p className="text-sm text-gray-700 mt-1">{testPrompt.rawText}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Scaffold Analysis:</span>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                      {testPrompt.scaffold.map((slot) => (
                        <div
                          key={slot.key}
                          className={`h-3 rounded ${
                            slot.content.trim() ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                          title={`${slot.name}: ${slot.content.trim() ? 'Filled' : 'Empty'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={createSamplePrompt}
                    className="w-full"
                  >
                    Generate New Sample
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Preview */}
          {selectedFormat && testPrompt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Preview: {selectedFormat.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded text-sm font-mono">
                    {getFormattedPreview()}
                  </div>
                  <p className="text-xs text-gray-600">
                    This shows how your custom format renders with the sample prompt data.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Standard Templates Comparison */}
          {testPrompt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Compare with Standard Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PromptSwitcher
                  prompt={testPrompt}
                  onTemplateChange={() => {}}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">
            Custom Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>
            <strong>Creating Custom Formats:</strong> Use the 7 scaffold tokens {`{S} {C} {St} {Co} {L} {A} {Q}`} 
            to create templates that match your specific AI model&apos;s requirements.
          </p>
          <p>
            <strong>Token Meanings:</strong> S=Subject, C=Context, St=Style, Co=Composition, L=Lighting, A=Atmosphere, Q=Quality
          </p>
          <p>
            <strong>Examples:</strong> Comma-separated: {`"{S}, {C}, {St}"`}, Parameter-style: {`"{S} --style {St} --quality {Q}"`}, 
            Natural language: {`"A {St} image of {S} in {C}"`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}