'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validateApiKey } from '@/lib/validation';
import { testGeminiApiKey } from '@/lib/gemini';
import { Eye, EyeOff, Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeyValidated?: (apiKey: string) => void;
  className?: string;
}

export function ApiKeyInput({ onApiKeyValidated, className }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationError, setValidationError] = useState<string>('');
  const [hasStoredKey, setHasStoredKey] = useState(false);

  // Check for existing API key on component mount
  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setHasStoredKey(true);
      setValidationStatus('valid');
    }
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setValidationStatus('idle');
    setValidationError('');
    
    // Clear stored key if user is modifying
    if (hasStoredKey && value !== sessionStorage.getItem('gemini_api_key')) {
      setHasStoredKey(false);
    }
  };

  const validateAndStoreApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('API key is required');
      setValidationStatus('invalid');
      return;
    }

    // Basic format validation
    const basicValidation = validateApiKey(apiKey);
    if (!basicValidation.isValid) {
      setValidationError(basicValidation.error || 'Invalid API key format');
      setValidationStatus('invalid');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Test the API key with a real Gemini API call
      const isValid = await testGeminiApiKey(apiKey);
      
      if (isValid) {
        // Store in sessionStorage
        sessionStorage.setItem('gemini_api_key', apiKey);
        setValidationStatus('valid');
        setHasStoredKey(true);
        
        // Notify parent component
        onApiKeyValidated?.(apiKey);
      } else {
        setValidationError('API key is invalid or has insufficient permissions');
        setValidationStatus('invalid');
      }
    } catch (error) {
      console.error('API key validation error:', error);
      setValidationError('Failed to validate API key. Please check your connection and try again.');
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setValidationStatus('idle');
    setValidationError('');
    setHasStoredKey(false);
    sessionStorage.removeItem('gemini_api_key');
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Key className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (validationStatus) {
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Gemini API Key
        </CardTitle>
        <CardDescription>
          Enter your Google Gemini API key to enable AI-powered prompt generation.
          {' '}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Get your API key here
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="api-key" className="text-sm font-medium">
              API Key
            </label>
            {getStatusBadge()}
          </div>
          
          <div className="relative">
            <Input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="pr-20"
              disabled={isValidating}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {getStatusIcon()}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isValidating}
              >
                {showApiKey ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {validationError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {validationError}
            </p>
          )}

          {hasStoredKey && validationStatus === 'valid' && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              API key is stored and validated
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={validateAndStoreApiKey}
            disabled={isValidating || !apiKey.trim()}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate & Save'
            )}
          </Button>
          
          {(hasStoredKey || apiKey) && (
            <Button
              variant="outline"
              onClick={clearApiKey}
              disabled={isValidating}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your API key is stored locally in your browser session</p>
          <p>• The key is validated with a test API call to ensure it works</p>
          <p>• Your API key is never sent to our servers</p>
        </div>
      </CardContent>
    </Card>
  );
}