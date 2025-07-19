import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDrivePersistence, useChatPersistence, useCustomFormatsPersistence } from '@/hooks/useDrivePersistence';
import { ChatMessage, CustomFormat } from '@/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Drive Persistence System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('useDrivePersistence Hook', () => {
    it('should initialize with default state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, hasAccess: false })
      });

      const { result } = renderHook(() => useDrivePersistence());
      
      // Initially loading should be false, but will become true immediately due to checkAccess
      expect(result.current.hasAccess).toBe(false);
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();

      // Wait for the checkAccess to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should check Drive access on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, hasAccess: true })
      });

      const { result } = renderHook(() => useDrivePersistence());
      
      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/drive/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkAccess' })
      });
    });

    it('should save data successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, message: 'Data saved' })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      const testData = { test: 'data' };
      
      await act(async () => {
        await result.current.saveData('chats', testData);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/drive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chats', data: testData })
      });
    });

    it('should load data successfully', async () => {
      const testData = { chats: [], customFormats: [] };
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: testData })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      let loadedData;
      await act(async () => {
        loadedData = await result.current.loadData('all');
      });

      expect(loadedData).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/api/drive/load?type=all');
    });

    it('should handle save errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Save failed' })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      await act(async () => {
        try {
          await result.current.saveData('chats', {});
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.error).toContain('Save failed');
    });

    it('should handle load errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Load failed' })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      await act(async () => {
        try {
          await result.current.loadData('chats');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.error).toContain('Load failed');
    });

    it('should create backup successfully', async () => {
      const backupFileName = 'backup_123456.json';
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, backupFileName })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      let fileName;
      await act(async () => {
        fileName = await result.current.createBackup();
      });

      expect(fileName).toBe(backupFileName);
    });

    it('should clear errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' })
      });

      const { result } = renderHook(() => useDrivePersistence());
      
      // Trigger an error
      await act(async () => {
        try {
          await result.current.checkAccess();
        } catch (error) {
          // Expected to fail
        }
      });

      expect(result.current.error).toBeTruthy();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useChatPersistence Hook', () => {
    it('should initialize with empty messages', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] })
      });

      const { result } = renderHook(() => useChatPersistence());
      
      expect(result.current.messages).toEqual([]);
    });

    it('should add messages', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useChatPersistence());
      
      const newMessage: ChatMessage = {
        id: '1',
        type: 'user',
        content: 'Test message',
        timestamp: new Date()
      };

      await act(async () => {
        await result.current.addMessage(newMessage);
      });

      expect(result.current.messages).toContain(newMessage);
    });

    it('should clear messages', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useChatPersistence());
      
      await act(async () => {
        await result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('useCustomFormatsPersistence Hook', () => {
    it('should initialize with empty formats', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] })
      });

      const { result } = renderHook(() => useCustomFormatsPersistence());
      
      expect(result.current.formats).toEqual([]);
    });

    it('should add formats', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useCustomFormatsPersistence());
      
      const newFormat: CustomFormat = {
        id: '1',
        name: 'Test Format',
        template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
        validation: true,
        slots: []
      };

      await act(async () => {
        await result.current.addFormat(newFormat);
      });

      expect(result.current.formats).toContain(newFormat);
    });

    it('should update formats', async () => {
      const existingFormat: CustomFormat = {
        id: '1',
        name: 'Test Format',
        template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
        validation: true,
        slots: []
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [existingFormat] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useCustomFormatsPersistence());
      
      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verify the format was loaded
      expect(result.current.formats).toHaveLength(1);
      expect(result.current.formats[0].name).toBe('Test Format');
      
      const updatedFormat = { ...existingFormat, name: 'Updated Format' };

      await act(async () => {
        await result.current.updateFormat('1', updatedFormat);
      });

      expect(result.current.formats.find(f => f.id === '1')?.name).toBe('Updated Format');
    });

    it('should delete formats', async () => {
      const existingFormat: CustomFormat = {
        id: '1',
        name: 'Test Format',
        template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
        validation: true,
        slots: []
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [existingFormat] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useCustomFormatsPersistence());
      
      await act(async () => {
        await result.current.deleteFormat('1');
      });

      expect(result.current.formats.find(f => f.id === '1')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDrivePersistence());
      
      await act(async () => {
        try {
          await result.current.checkAccess();
        } catch (error) {
          // Expected to fail
        }
      });

      expect(result.current.error).toContain('Network error');
    });

    it('should handle API errors with error codes', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ 
            error: 'Unauthorized', 
            code: 'UNAUTHORIZED' 
          })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      await act(async () => {
        try {
          await result.current.saveData('chats', {});
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.error).toContain('Unauthorized');
    });

    it('should handle malformed API responses', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ invalid: 'response' })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      await act(async () => {
        try {
          await result.current.loadData('chats');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: null })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      let loadedData;
      await act(async () => {
        loadedData = await result.current.loadData('chats');
      });

      expect(loadedData).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, hasAccess: true })
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useDrivePersistence());
      
      // Start multiple operations concurrently
      const operations = [
        result.current.saveData('chats', []),
        result.current.saveData('customFormats', []),
        result.current.loadData('userPreferences')
      ];

      await act(async () => {
        await Promise.all(operations);
      });

      // Should not crash and should handle all operations
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 for checkAccess + 3 for operations
    });
  });
});