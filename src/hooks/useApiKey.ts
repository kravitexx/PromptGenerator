'use client';

import { useState, useEffect } from 'react';
import { getStoredApiKey, testGeminiApiKey } from '@/lib/gemini';

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
      const isValid = await testGeminiApiKey(newApiKey);
      
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
          error: 'Invalid API key',
        }));
        return false;
      }
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to validate API key',
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