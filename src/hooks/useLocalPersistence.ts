'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, CustomFormat, GeneratedPrompt } from '@/types';

interface LocalStorageData {
  chats: ChatMessage[];
  customFormats: CustomFormat[];
  savedPrompts: GeneratedPrompt[];
}

const STORAGE_KEY = 'prompt-generator-data';

export function useLocalPersistence() {
  const [data, setData] = useState<LocalStorageData>({
    chats: [],
    customFormats: [],
    savedPrompts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.chats) {
          parsed.chats = parsed.chats.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
        setData(parsed);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage with size management
  const saveData = useCallback((newData: Partial<LocalStorageData>) => {
    try {
      const updatedData = { ...data, ...newData };
      
      // If saving chats, remove images from old messages to save space
      if (newData.chats) {
        const chatsWithoutImages = newData.chats.map(chat => ({
          ...chat,
          images: undefined // Don't persist images in localStorage due to size limits
        }));
        updatedData.chats = chatsWithoutImages;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setData(updatedData);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Clearing old data and retrying...');
        // Clear old messages and try again
        try {
          const minimalData = {
            chats: newData.chats ? newData.chats.slice(-5).map(chat => ({
              ...chat,
              images: undefined
            })) : data.chats.slice(-5).map(chat => ({
              ...chat,
              images: undefined
            })),
            customFormats: data.customFormats,
            savedPrompts: data.savedPrompts.slice(-10) // Keep only last 10 prompts
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalData));
          setData(minimalData);
        } catch (retryError) {
          console.error('Failed to save even minimal data:', retryError);
          // Clear everything as last resort
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        console.error('Failed to save data to localStorage:', error);
      }
    }
  }, [data]);

  // Chat message operations
  const addMessage = useCallback(async (message: ChatMessage) => {
    const updatedChats = [...data.chats, message];
    saveData({ chats: updatedChats });
  }, [data.chats, saveData]);

  const clearChats = useCallback(() => {
    saveData({ chats: [] });
  }, [saveData]);

  // Custom format operations
  const saveCustomFormat = useCallback((format: CustomFormat) => {
    const existingIndex = data.customFormats.findIndex(f => f.id === format.id);
    let updatedFormats;
    
    if (existingIndex >= 0) {
      updatedFormats = [...data.customFormats];
      updatedFormats[existingIndex] = format;
    } else {
      updatedFormats = [...data.customFormats, format];
    }
    
    saveData({ customFormats: updatedFormats });
  }, [data.customFormats, saveData]);

  const deleteCustomFormat = useCallback((formatId: string) => {
    const updatedFormats = data.customFormats.filter(f => f.id !== formatId);
    saveData({ customFormats: updatedFormats });
  }, [data.customFormats, saveData]);

  // Saved prompt operations
  const savePrompt = useCallback((prompt: GeneratedPrompt) => {
    const existingIndex = data.savedPrompts.findIndex(p => p.id === prompt.id);
    let updatedPrompts;
    
    if (existingIndex >= 0) {
      updatedPrompts = [...data.savedPrompts];
      updatedPrompts[existingIndex] = prompt;
    } else {
      updatedPrompts = [...data.savedPrompts, prompt];
    }
    
    saveData({ savedPrompts: updatedPrompts });
  }, [data.savedPrompts, saveData]);

  const deletePrompt = useCallback((promptId: string) => {
    const updatedPrompts = data.savedPrompts.filter(p => p.id !== promptId);
    saveData({ savedPrompts: updatedPrompts });
  }, [data.savedPrompts, saveData]);

  return {
    // Data
    messages: data.chats,
    customFormats: data.customFormats,
    savedPrompts: data.savedPrompts,
    isLoading,
    
    // Chat operations
    addMessage,
    clearChats,
    
    // Custom format operations
    saveCustomFormat,
    deleteCustomFormat,
    
    // Prompt operations
    savePrompt,
    deletePrompt
  };
}

// Hook for chat persistence (compatible with existing usage)
export function useChatPersistence() {
  const { messages, addMessage, clearChats, isLoading } = useLocalPersistence();
  
  return {
    messages,
    addMessage,
    clearChats,
    isLoading
  };
}

// Hook for custom formats persistence
export function useCustomFormatsPersistence() {
  const { customFormats, saveCustomFormat, deleteCustomFormat, isLoading } = useLocalPersistence();
  
  return {
    customFormats,
    saveCustomFormat,
    deleteCustomFormat,
    isLoading
  };
}