import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generatePromptWithGemini, 
  analyzeImageWithGemini, 
  testGeminiApiKey,
  generateClarifyingQuestions,
  generatePromptSuggestions
} from '@/lib/gemini';

// Mock fetch globally
global.fetch = vi.fn();

describe('Gemini API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePromptWithGemini', () => {
    it('should generate prompt successfully', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: 'Enhanced prompt text',
            }],
          },
        }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generatePromptWithGemini({
        prompt: 'test prompt',
        apiKey: 'test-api-key',
        images: []
      });

      expect(result.generatedPrompt.rawText).toBe('Enhanced prompt text');
      expect(result.generatedPrompt.id).toBeTruthy();
      expect(result.suggestions).toEqual([]);
      expect(result.clarifyingQuestions).toEqual([]);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Invalid request' } }),
      });

      await expect(generatePromptWithGemini({
        prompt: 'test',
        apiKey: 'invalid-key',
        images: []
      })).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(generatePromptWithGemini({
        prompt: 'test',
        apiKey: 'test-key',
        images: []
      })).rejects.toThrow('Network error');
    });
  });

  describe('analyzeImageWithGemini', () => {
    it('should analyze image successfully', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                description: 'A beautiful sunset',
                tokenComparison: [
                  { token: 'sunset', present: true, confidence: 0.9 },
                  { token: 'beach', present: false, confidence: 0.1 },
                ],
                suggestions: ['Add more sky details'],
              }),
            }],
          },
        }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await analyzeImageWithGemini({
        image: 'base64-image',
        originalPrompt: 'sunset prompt',
        apiKey: 'test-key'
      });

      expect(result.description).toBe('A beautiful sunset');
      expect(result.tokenComparison).toHaveLength(2);
      expect(result.suggestions).toHaveLength(1);
    });

    it('should handle invalid image data', async () => {
      await expect(analyzeImageWithGemini({
        image: '',
        originalPrompt: 'prompt',
        apiKey: 'key'
      })).rejects.toThrow();
    });
  });

  describe('testGeminiApiKey', () => {
    it('should validate API key successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'test' }] } }] }),
      });

      const result = await testGeminiApiKey('valid-key');

      expect(result).toBe(true);
    });

    it('should reject invalid API key', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'API_KEY_INVALID' } }),
      });

      const result = await testGeminiApiKey('invalid-key');

      expect(result).toBe(false);
    });

    it('should handle network errors during validation', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await testGeminiApiKey('test-key');

      expect(result).toBe(false);
    });
  });

  describe('generateClarifyingQuestions', () => {
    it('should generate clarifying questions', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                { id: '1', question: 'What style do you prefer?', type: 'select', options: ['Realistic', 'Cartoon'] }
              ]),
            }],
          },
        }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generateClarifyingQuestions('test prompt', 'test-key');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('question');
    });

    it('should handle empty response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      const result = await generateClarifyingQuestions('test', 'key');

      expect(result).toEqual([]);
    });
  });

  describe('generatePromptSuggestions', () => {
    it('should generate suggestions', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(['Add more detail', 'Specify lighting']),
            }],
          },
        }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generatePromptSuggestions('test prompt', 'test-key');

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Add more detail');
    });
  });
});