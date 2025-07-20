import { useState, useEffect, useCallback } from 'react';
import { DriveData, ChatMessage, CustomFormat, UserPreferences } from '@/types';
import { deserializeChatMessages } from '@/lib/utils';

interface DriveState {
  isLoading: boolean;
  hasAccess: boolean;
  lastSaved: Date | null;
  error: string | null;
  data: DriveData | null;
}

interface DriveOperations {
  saveData: (type: 'all' | 'chats' | 'customFormats' | 'userPreferences', data: unknown) => Promise<void>;
  loadData: (type?: 'all' | 'chats' | 'customFormats' | 'userPreferences') => Promise<unknown>;
  checkAccess: () => Promise<boolean>;
  createBackup: () => Promise<string>;
  restoreFromBackup: (backupFileName: string) => Promise<void>;
  clearError: () => void;
}

export function useDrivePersistence(): DriveState & DriveOperations {
  const [state, setState] = useState<DriveState>({
    isLoading: false,
    hasAccess: false,
    lastSaved: null,
    error: null,
    data: null
  });

  const checkAccess = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/drive/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkAccess' })
      });

      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          hasAccess: result.hasAccess,
          isLoading: false 
        }));
        return result.hasAccess;
      } else {
        throw new Error(result.error || 'Failed to check Drive access');
      }
    } catch (error) {
      // Don't show error for Drive access check - just assume no access
      console.warn('Drive access check failed:', error);
      setState(prev => ({ 
        ...prev, 
        hasAccess: false,
        isLoading: false,
        error: null // Don't show error to user
      }));
      return false;
    }
  }, []);

  // Don't automatically check Drive access on mount to avoid authentication errors
  // Users can manually connect Drive when they want to

  const saveData = useCallback(async (
    type: 'all' | 'chats' | 'customFormats' | 'userPreferences', 
    data: unknown
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/drive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });

      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          lastSaved: new Date(),
          data: type === 'all' ? (data as DriveData) : { ...(prev.data || {} as DriveData), [type]: data } as DriveData
        }));
      } else {
        throw new Error(result.error || 'Failed to save data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Save failed: ${errorMessage}` 
      }));
      throw error;
    }
  }, []);

  const loadData = useCallback(async (
    type: 'all' | 'chats' | 'customFormats' | 'userPreferences' = 'all'
  ): Promise<unknown> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/drive/load?type=${type}`);
      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          data: type === 'all' ? (result.data as DriveData) : { ...(prev.data || {} as DriveData), [type]: result.data } as DriveData
        }));
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Load failed: ${errorMessage}` 
      }));
      throw error;
    }
  }, []);

  const createBackup = useCallback(async (): Promise<string> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/drive/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'backup' })
      });

      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        return result.backupFileName;
      } else {
        throw new Error(result.error || 'Failed to create backup');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Backup failed: ${errorMessage}` 
      }));
      throw error;
    }
  }, []);

  const restoreFromBackup = useCallback(async (backupFileName: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/drive/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'restore', 
          options: { backupFileName } 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        // Reload data after restore
        await loadData();
      } else {
        throw new Error(result.error || 'Failed to restore from backup');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Restore failed: ${errorMessage}` 
      }));
      throw error;
    }
  }, [loadData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    saveData,
    loadData,
    checkAccess,
    createBackup,
    restoreFromBackup,
    clearError
  };
}

// Auto-save hook for specific data types
export function useAutoSave<T>(
  data: T,
  type: 'chats' | 'customFormats' | 'userPreferences',
  delay: number = 5000 // 5 seconds
) {
  const { saveData, isLoading, error } = useDrivePersistence();
  const [lastSaveAttempt, setLastSaveAttempt] = useState<Date | null>(null);

  useEffect(() => {
    if (!data) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveData(type, data);
        setLastSaveAttempt(new Date());
      } catch (error) {
        console.error(`Auto-save failed for ${type}:`, error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, type, delay, saveData]);

  return {
    isAutoSaving: isLoading,
    autoSaveError: error,
    lastSaveAttempt
  };
}

// Hook for managing chat persistence specifically
export function useChatPersistence() {
  const { saveData, loadData, isLoading, error, hasAccess } = useDrivePersistence();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadMessages = useCallback(async () => {
    try {
      if (hasAccess) {
        // Try to load from Drive first
        const loadedMessages = await loadData('chats');
        setMessages(deserializeChatMessages((loadedMessages as ChatMessage[]) || []));
      } else {
        // Fallback to localStorage
        const localMessages = localStorage.getItem('chat_messages');
        if (localMessages) {
          try {
            const parsed = JSON.parse(localMessages);
            setMessages(deserializeChatMessages(parsed));
          } catch (parseError) {
            console.error('Failed to parse localStorage messages, clearing corrupted data:', parseError);
            localStorage.removeItem('chat_messages');
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load chat messages from Drive, trying localStorage:', error);
      // Fallback to localStorage
      try {
        const localMessages = localStorage.getItem('chat_messages');
        if (localMessages) {
          const parsed = JSON.parse(localMessages);
          setMessages(deserializeChatMessages(parsed));
        }
      } catch (parseError) {
        console.error('Failed to parse localStorage messages, clearing corrupted data:', parseError);
        localStorage.removeItem('chat_messages');
        setMessages([]);
      }
    }
  }, [loadData, hasAccess]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const saveMessages = useCallback(async (newMessages: ChatMessage[]) => {
    try {
      // Always save to localStorage as fallback
      localStorage.setItem('chat_messages', JSON.stringify(newMessages));
      
      // Only try to save to Drive if we have access
      if (hasAccess) {
        await saveData('chats', newMessages);
      }
      setMessages(newMessages);
    } catch (error) {
      console.warn('Failed to save chat messages to Drive, saved locally:', error);
      // Still update local state
      setMessages(newMessages);
    }
  }, [saveData, hasAccess]);

  const addMessage = useCallback(async (message: ChatMessage) => {
    const updatedMessages = [...messages, message];
    try {
      await saveMessages(updatedMessages);
    } catch (error) {
      // If save fails, still update local state
      console.warn('Failed to save message to Drive, continuing with local storage:', error);
      setMessages(updatedMessages);
    }
  }, [messages, saveMessages]);

  const clearMessages = useCallback(async () => {
    await saveMessages([]);
  }, [saveMessages]);

  return {
    messages,
    addMessage,
    saveMessages,
    clearMessages,
    loadMessages,
    isLoading,
    error
  };
}

// Hook for managing custom formats persistence
export function useCustomFormatsPersistence() {
  const { saveData, loadData, isLoading, error } = useDrivePersistence();
  const [formats, setFormats] = useState<CustomFormat[]>([]);

  const loadFormats = useCallback(async () => {
    try {
      const loadedFormats = await loadData('customFormats');
      setFormats((loadedFormats as CustomFormat[]) || []);
    } catch (error) {
      console.error('Failed to load custom formats:', error);
    }
  }, [loadData]);

  // Load formats on mount
  useEffect(() => {
    loadFormats();
  }, [loadFormats]);

  const saveFormats = useCallback(async (newFormats: CustomFormat[]) => {
    try {
      await saveData('customFormats', newFormats);
      setFormats(newFormats);
    } catch (error) {
      console.error('Failed to save custom formats:', error);
      throw error;
    }
  }, [saveData]);

  const addFormat = useCallback(async (format: CustomFormat) => {
    const updatedFormats = [...formats, format];
    await saveFormats(updatedFormats);
  }, [formats, saveFormats]);

  const updateFormat = useCallback(async (formatId: string, updatedFormat: CustomFormat) => {
    const updatedFormats = formats.map(f => f.id === formatId ? updatedFormat : f);
    await saveFormats(updatedFormats);
  }, [formats, saveFormats]);

  const deleteFormat = useCallback(async (formatId: string) => {
    const updatedFormats = formats.filter(f => f.id !== formatId);
    await saveFormats(updatedFormats);
  }, [formats, saveFormats]);

  return {
    formats,
    addFormat,
    updateFormat,
    deleteFormat,
    saveFormats,
    loadFormats,
    isLoading,
    error
  };
}