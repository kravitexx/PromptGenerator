'use client';

import { useState, useEffect } from 'react';
import { getStoredApiKey, testGeminiApiKey, testGeminiApiKeyAlternative, testGeminiApiKeyMinimal } from '@/lib/gemini';

export interface ApiKeyState {
  apiKey: string | null;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useApiKey() {
  const [state, setState] = useState<ApiKeyState>({
    apiKey: null,
    isValid: false,
    isLoading: true,
    error: null,
  });

  // Check for stored API key on mount
  useEffect(() => {
    const checkStoredApiKey = async () => {
      const storedKey = getStoredApiKey();
      
      if (!storedKey) {
        setState({
          apiKey: null,
          isValid: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Validate the stored key
      try {
        const isValid = await testGeminiApiKey(storedKey);
        setState({
          apiKey: storedKey,
          isValid,
          isLoading: false,
          error: isValid ? null : 'Stored API key is no longer valid',
        });
      } catch {
        setState({
          apiKey: storedKey,
          isValid: false,
          isLoading: false,
          error: 'Failed to validate stored API key',
        });
      }
    };

    checkStoredApiKey();
  }, []);

  const setApiKey = async (newApiKey: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Basic validation first
      if (!newApiKey || newApiKey.trim().length === 0) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please enter an API key',
        }));
        return false;
      }

      // More lenient format validation - warn but don't block
      if (!newApiKey.startsWith('AIzaSy')) {
        console.warn('API key format may be incorrect. Gemini API keys typically start with "AIzaSy"');
      }

      if (newApiKey.length < 20) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'API key appears to be too short. Please check your key.',
        }));
        return false;
      }

      // Try multiple validation methods - start with quota-free method
      console.log('Starting API key validation...');
      
      // Method 1: Direct API call (doesn't use generation quota)
      let isValid = await testGeminiApiKeyAlternative(newApiKey);
      
      // Only try generation methods if direct API fails
      if (!isValid) {
        console.log('Direct API validation failed, trying SDK with Gemini 2.5 Pro...');
        isValid = await testGeminiApiKey(newApiKey);
      }
      
      if (isValid) {
        sessionStorage.setItem('gemini_api_key', newApiKey);
        setState({
          apiKey: newApiKey,
          isValid: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'API key is invalid or has insufficient permissions. Please verify your key from Google AI Studio.',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to validate API key. Please check your internet connection and try again.',
      }));
      return false;
    }
  };

  const clearApiKey = () => {
    sessionStorage.removeItem('gemini_api_key');
    setState({
      apiKey: null,
      isValid: false,
      isLoading: false,
      error: null,
    });
  };

  const refreshValidation = async () => {
    if (!state.apiKey) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const isValid = await testGeminiApiKey(state.apiKey);
      setState(prev => ({
        ...prev,
        isValid,
        isLoading: false,
        error: isValid ? null : 'API key is no longer valid',
      }));
    } catch {
      setState(prev => ({
        ...prev,
        isValid: false,
        isLoading: false,
        error: 'Failed to validate API key',
      }));
    }
  };

  return {
    ...state,
    setApiKey,
    clearApiKey,
    refreshValidation,
    hasValidKey: state.isValid && Boolean(state.apiKey),
  };
}