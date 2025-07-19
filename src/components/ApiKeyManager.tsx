/**
 * API Key Management Component
 * Allows users to view, change, or remove their API key
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApiKey } from '@/hooks/useApiKey';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface ApiKeyManagerProps {
  className?: string;
  compact?: boolean;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ 
  className, 
  compact = false 
}) => {
  const { apiKey, hasValidKey, isLoading, error, setApiKey, clearApiKey, refreshValidation } = useApiKey();
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim()) return;

    setIsUpdating(true);
    try {
      const success = await setApiKey(newApiKey.trim());
      if (success) {
        setIsEditing(false);
        setNewApiKey('');
        setShowKey(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setIsEditing(false);
    setNewApiKey('');
    setShowKey(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewApiKey('');
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-gray-500" />
          <Badge variant={hasValidKey ? 'default' : 'secondary'}>
            {hasValidKey ? 'API Key Active' : 'No API Key'}
          </Badge>
        </div>
        
        {hasValidKey && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearApiKey}
              className="h-6 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center gap-2 ml-2">
            <Input
              type="password"
              placeholder="Enter new API key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="h-6 text-xs w-48"
            />
            <Button
              size="sm"
              onClick={handleUpdateApiKey}
              disabled={!newApiKey.trim() || isUpdating}
              className="h-6 px-2"
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-6 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Manage your Google Gemini API key for AI-powered prompt generation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${hasValidKey ? 'bg-green-500' : 'bg-gray-400'}`} />
            <div>
              <p className="font-medium">
                {hasValidKey ? 'API Key Active' : 'No API Key Set'}
              </p>
              {apiKey && (
                <p className="text-sm text-gray-600">
                  {showKey ? apiKey : maskApiKey(apiKey)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {apiKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            
            {hasValidKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshValidation}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Edit Form */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-api-key">New API Key</Label>
              <Input
                id="new-api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUpdateApiKey}
                disabled={!newApiKey.trim() || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update Key
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {hasValidKey ? 'Change Key' : 'Add Key'}
            </Button>
            
            {hasValidKey && (
              <Button
                variant="outline"
                onClick={handleClearApiKey}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Key
              </Button>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            Don't have an API key? Get one from{' '}
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <p className="text-xs text-gray-500">
            Your API key is stored securely in your browser and never sent to our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};