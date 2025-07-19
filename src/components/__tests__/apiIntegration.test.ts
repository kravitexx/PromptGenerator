import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePrompt, analyzeImage, handleApiError, checkApiHealth } from '@/lib/api';
import { GeminiError } from '@/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the gemini module
vi.mock('@/lib/gemini', () => ({
  getStoredApiKey: vi.fn(() => 'mock-api-key'),
  testGeminiApiKey: vi.fn(() => Promise.resolve(true)),
}));

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('generatePrompt', () => {
    it('should generate prompt successfully', async () => {
      const mockResponse = {
        data: {
          generatedPrompt: {
            id: 'test-id',
            scaffold: [],
            rawText: 'test prompt',
            formattedOutputs: {},
            metadata: { createdAt: new Date(), model: 'test', version: 1 }
          },
          originalInput: 'test input',
          enhancedText: 'enhanced test prompt',
          suggestions: ['suggestion 1'],
          clarifyingQuestions: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generatePrompt('test prompt');

      expect(result).toBeDefined();
      expect(result.generatedPrompt).toBeDefined();
      expect(result.enhancedText).toBe('enhanced test prompt');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/gemini/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test prompt'),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          code: 'INVALID_REQUEST',
          error: 'Invalid request format',
          details: { field: 'prompt' }
        }),
      });

      await expect(generatePrompt('test')).rejects.toThrow(GeminiError);
    });

    it('should validate input before making API call', async () => {
      // Test empty input
      await expect(generatePrompt('')).rejects.toThrow();
      
      // Test overly long input
      const longInput = 'a'.repeat(2001);
      await expect(generatePrompt(longInput)).rejects.toThrow();
      
      // Test potentially harmful input
      await expect(generatePrompt('<script>alert("xss")</script>')).rejects.toThrow();
    });

    it('should sanitize input before API call', async () => {
      const mockResponse = {
        data: {
          generatedPrompt: { id: 'test' },
          enhancedText: 'clean prompt',
          suggestions: [],
          clarifyingQuestions: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await generatePrompt('test <script>alert("xss")</script> prompt');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.prompt).not.toContain('<script>');
      expect(callBody.prompt).not.toContain('alert');
    });

    it('should retry on transient failures', async () => {
      // First call fails with retryable error
      mockFetch
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              generatedPrompt: { id: 'test' },
              enhancedText: 'success after retry',
              suggestions: [],
              clarifyingQuestions: []
            }
          }),
        });

      const result = await generatePrompt('test prompt');

      expect(result.enhancedText).toBe('success after retry');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      mockFetch.mockRejectedValueOnce(
        new GeminiError('MISSING_API_KEY', 'No API key provided')
      );

      await expect(generatePrompt('test')).rejects.toThrow('No API key provided');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle images in prompt generation', async () => {
      const mockResponse = {
        data: {
          generatedPrompt: { id: 'test' },
          enhancedText: 'prompt with image context',
          suggestions: [],
          clarifyingQuestions: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const images = ['base64-image-data'];
      await generatePrompt('describe this image', images);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.images).toEqual(images);
    });
  });

  describe('analyzeImage', () => {
    it('should analyze image successfully', async () => {
      const mockResponse = {
        data: {
          description: 'A beautiful landscape',
          tokenComparison: [
            { token: 'landscape', present: true, confidence: 0.9 }
          ],
          suggestions: ['Add more detail about the lighting']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeImage('base64-image', 'landscape photo');

      expect(result.description).toBe('A beautiful landscape');
      expect(result.tokenComparison).toHaveLength(1);
      expect(result.suggestions).toHaveLength(1);
    });

    it('should validate inputs before analysis', async () => {
      // Test empty image
      await expect(analyzeImage('', 'prompt')).rejects.toThrow();
      
      // Test empty prompt
      await expect(analyzeImage('image-data', '')).rejects.toThrow();
      
      // Test invalid prompt
      const longPrompt = 'a'.repeat(2001);
      await expect(analyzeImage('image-data', longPrompt)).rejects.toThrow();
    });

    it('should sanitize prompt input', async () => {
      const mockResponse = {
        data: {
          description: 'Clean analysis',
          tokenComparison: [],
          suggestions: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await analyzeImage('image-data', 'test <script>alert("xss")</script> prompt');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.originalPrompt).not.toContain('<script>');
    });

    it('should handle analysis errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          code: 'ANALYSIS_FAILED',
          error: 'Failed to analyze image',
        }),
      });

      await expect(analyzeImage('image-data', 'test prompt')).rejects.toThrow(GeminiError);
    });

    it('should retry on transient analysis failures', async () => {
      mockFetch
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              description: 'Analysis after retry',
              tokenComparison: [],
              suggestions: []
            }
          }),
        });

      const result = await analyzeImage('image-data', 'test prompt');

      expect(result.description).toBe('Analysis after retry');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleApiError', () => {
    it('should handle GeminiError correctly', () => {
      const error = new GeminiError('INVALID_API_KEY', 'Invalid API key provided');
      const message = handleApiError(error);
      
      expect(message).toContain('Invalid API key');
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error message');
      const message = handleApiError(error);
      
      expect(message).toBe('Generic error message');
    });

    it('should handle unknown error types', () => {
      const error = 'string error';
      const message = handleApiError(error);
      
      expect(message).toContain('Something went wrong');
    });

    it('should provide user-friendly messages', () => {
      const networkError = new TypeError('fetch failed');
      const message = handleApiError(networkError);
      
      expect(message).toContain('internet connection');
    });
  });

  describe('checkApiHealth', () => {
    it('should return true for healthy API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const isHealthy = await checkApiHealth();

      expect(isHealthy).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/health',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should return false for unhealthy API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const isHealthy = await checkApiHealth();

      expect(isHealthy).toBe(false);
    });

    it('should return false on network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isHealthy = await checkApiHealth();

      expect(isHealthy).toBe(false);
    });
  });

  describe('API Configuration', () => {
    it('should use correct API base URL in development', () => {
      // The API should use localhost in development
      expect(mockFetch.mock.calls[0]?.[0]).toContain('localhost:3000');
    });

    it('should include proper headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await generatePrompt('test').catch(() => {}); // Ignore errors for this test

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should handle missing API key', async () => {
      // Mock missing API key
      const { getStoredApiKey } = await import('@/lib/gemini');
      vi.mocked(getStoredApiKey).mockReturnValueOnce(null);

      await expect(generatePrompt('test')).rejects.toThrow('API key');
    });
  });

  describe('Response Validation', () => {
    it('should validate API response structure', async () => {
      // Invalid response structure
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      await expect(generatePrompt('test')).rejects.toThrow('Invalid response format');
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(generatePrompt('test')).rejects.toThrow();
    });

    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      await expect(generatePrompt('test')).rejects.toThrow();
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockResponse = {
        data: {
          generatedPrompt: { id: 'test' },
          enhancedText: 'concurrent response',
          suggestions: [],
          clarifyingQuestions: []
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const promises = Array.from({ length: 5 }, (_, i) => 
        generatePrompt(`test prompt ${i}`)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockFetch).toHaveBeenCalledTimes(5);
      results.forEach(result => {
        expect(result.enhancedText).toBe('concurrent response');
      });
    });

    it('should handle mixed success and failure in concurrent requests', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { generatedPrompt: { id: '1' }, enhancedText: 'success 1' }
          }),
        })
        .mockRejectedValueOnce(new Error('Request 2 failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { generatedPrompt: { id: '3' }, enhancedText: 'success 3' }
          }),
        });

      const promises = [
        generatePrompt('test 1'),
        generatePrompt('test 2').catch(e => ({ error: e.message })),
        generatePrompt('test 3'),
      ];

      const results = await Promise.all(promises);

      expect(results[0].enhancedText).toBe('success 1');
      expect(results[1]).toHaveProperty('error');
      expect(results[2].enhancedText).toBe('success 3');
    });
  });
});