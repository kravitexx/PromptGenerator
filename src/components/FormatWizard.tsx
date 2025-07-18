'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomFormat } from '@/types';
import { SCAFFOLD_SLOTS } from '@/lib/scaffold';
import { 
  Wand2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Eye,
  Save,
  X,
  Copy,
  Lightbulb
} from 'lucide-react';

interface FormatWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (format: CustomFormat) => void;
  existingFormat?: CustomFormat;
}

interface ValidationError {
  field: string;
  message: string;
}

export function FormatWizard({ 
  isOpen, 
  onClose, 
  onSave, 
  existingFormat 
}: FormatWizardProps) {
  const [step, setStep] = useState(1);
  const [formatName, setFormatName] = useState('');
  const [formatTemplate, setFormatTemplate] = useState('');
  const [formatDescription, setFormatDescription] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewPrompt, setPreviewPrompt] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (existingFormat) {
        setFormatName(existingFormat.name);
        setFormatTemplate(existingFormat.template);
        setFormatDescription(existingFormat.name);
        setStep(1);
      } else {
        setFormatName('');
        setFormatTemplate('');
        setFormatDescription('');
        setStep(1);
      }
      setValidationErrors([]);
      setPreviewPrompt('');
    }
  }, [isOpen, existingFormat]);

  // Generate preview when template changes
  useEffect(() => {
    if (formatTemplate) {
      generatePreview();
    }
  }, [formatTemplate]);

  const requiredTokens = SCAFFOLD_SLOTS.map(slot => `{${slot.key}}`);

  const validateFormat = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate name
    if (!formatName.trim()) {
      errors.push({ field: 'name', message: 'Format name is required' });
    } else if (formatName.length < 3) {
      errors.push({ field: 'name', message: 'Format name must be at least 3 characters' });
    }

    // Validate template
    if (!formatTemplate.trim()) {
      errors.push({ field: 'template', message: 'Template format is required' });
    } else {
      // Check for all required scaffold tokens
      const missingTokens = requiredTokens.filter(token => 
        !formatTemplate.includes(token)
      );
      
      if (missingTokens.length > 0) {
        errors.push({ 
          field: 'template', 
          message: `Missing required tokens: ${missingTokens.join(', ')}` 
        });
      }

      // Check for invalid tokens
      const tokenPattern = /\{([^}]+)\}/g;
      const foundTokens = [...formatTemplate.matchAll(tokenPattern)].map(match => match[0]);
      const invalidTokens = foundTokens.filter(token => !requiredTokens.includes(token));
      
      if (invalidTokens.length > 0) {
        errors.push({ 
          field: 'template', 
          message: `Invalid tokens found: ${invalidTokens.join(', ')}` 
        });
      }
    }

    return errors;
  };

  const generatePreview = () => {
    const sampleData = {
      '{S}': 'a majestic dragon',
      '{C}': 'flying over a medieval castle',
      '{St}': 'digital art, fantasy style',
      '{Co}': 'wide shot, dramatic angle',
      '{L}': 'golden hour lighting',
      '{A}': 'epic, mystical atmosphere',
      '{Q}': 'high quality, detailed, 4K'
    };

    let preview = formatTemplate;
    Object.entries(sampleData).forEach(([token, value]) => {
      preview = preview.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    setPreviewPrompt(preview);
  };

  const handleNext = () => {
    if (step === 1) {
      const errors = validateFormat();
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        setStep(2);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    const errors = validateFormat();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      const customFormat: CustomFormat = {
        id: existingFormat?.id || crypto.randomUUID(),
        name: formatName.trim(),
        template: formatTemplate.trim(),
        validation: true,
        slots: SCAFFOLD_SLOTS.map(slot => ({ ...slot }))
      };
      
      onSave(customFormat);
      onClose();
    }
  };

  const insertToken = (token: string) => {
    const textarea = document.querySelector('textarea[name="template"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = formatTemplate.substring(0, start) + token + formatTemplate.substring(end);
      setFormatTemplate(newValue);
      
      // Set cursor position after inserted token
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    }
  };

  const getTokenStatus = (token: string) => {
    return formatTemplate.includes(token) ? 'included' : 'missing';
  };

  const predefinedTemplates = [
    {
      name: 'Stable Diffusion Style',
      template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
      description: 'Comma-separated format popular with Stable Diffusion'
    },
    {
      name: 'Midjourney Style',
      template: '{S} {C} --style {St} --composition {Co} --lighting {L} --mood {A} --quality {Q}',
      description: 'Parameter-based format similar to Midjourney'
    },
    {
      name: 'Descriptive Format',
      template: 'A {St} image of {S} in {C}. The composition shows {Co} with {L}. The overall {A} is enhanced by {Q}.',
      description: 'Natural language descriptive format'
    },
    {
      name: 'JSON Format',
      template: '{"subject": "{S}", "context": "{C}", "style": "{St}", "composition": "{Co}", "lighting": "{L}", "atmosphere": "{A}", "quality": "{Q}"}',
      description: 'Structured JSON format for API usage'
    }
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            {existingFormat ? 'Edit Custom Format' : 'Create Custom Format'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Define Format</span>
          </div>
          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Preview & Save</span>
          </div>
        </div>

        {/* Step 1: Define Format */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Format Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Format Name *</label>
              <Input
                value={formatName}
                onChange={(e) => setFormatName(e.target.value)}
                placeholder="e.g., My Custom Format"
                className={validationErrors.some(e => e.field === 'name') ? 'border-red-500' : ''}
              />
              {validationErrors.filter(e => e.field === 'name').map((error, index) => (
                <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {error.message}
                </p>
              ))}
            </div>

            {/* Predefined Templates */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Quick Start Templates</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predefinedTemplates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormatTemplate(template.template)}
                          className="ml-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Template Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Format *</label>
              <Textarea
                name="template"
                value={formatTemplate}
                onChange={(e) => setFormatTemplate(e.target.value)}
                placeholder="Enter your custom format template using scaffold tokens..."
                className={`min-h-[120px] font-mono text-sm ${validationErrors.some(e => e.field === 'template') ? 'border-red-500' : ''}`}
              />
              {validationErrors.filter(e => e.field === 'template').map((error, index) => (
                <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {error.message}
                </p>
              ))}
            </div>

            {/* Token Helper */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Available Scaffold Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SCAFFOLD_SLOTS.map((slot) => {
                    const token = `{${slot.key}}`;
                    const status = getTokenStatus(token);
                    return (
                      <Button
                        key={slot.key}
                        variant="outline"
                        size="sm"
                        onClick={() => insertToken(token)}
                        className={`justify-start h-auto p-2 ${
                          status === 'included' ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {status === 'included' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <div className="w-3 h-3 border border-gray-300 rounded-full" />
                          )}
                          <div className="text-left">
                            <div className="font-mono text-xs">{token}</div>
                            <div className="text-xs text-gray-600">{slot.name}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <Lightbulb className="h-3 w-3 inline mr-1" />
                  Click tokens to insert them at cursor position. All 7 tokens must be included.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Preview & Save */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Format Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Format Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Name:</span>
                  <span className="ml-2 text-sm">{formatName}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Template:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-xs break-all">
                    {formatTemplate}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Token Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {SCAFFOLD_SLOTS.map((slot) => {
                    const token = `{${slot.key}}`;
                    const isIncluded = formatTemplate.includes(token);
                    return (
                      <div key={slot.key} className="text-center">
                        <Badge 
                          variant={isIncluded ? 'default' : 'secondary'}
                          className={`text-xs ${isIncluded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {token}
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">{slot.name}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Preview with Sample Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  {previewPrompt || 'No preview available'}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This shows how your format will look with sample scaffold data.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            
            {step === 1 ? (
              <Button onClick={handleNext} disabled={!formatName.trim() || !formatTemplate.trim()}>
                Next: Preview
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={validationErrors.length > 0}>
                <Save className="h-4 w-4 mr-1" />
                Save Format
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}