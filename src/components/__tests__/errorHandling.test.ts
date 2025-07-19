import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  normalizeError, 
  createAppError, 
  ErrorType, 
  retryWithBackoff,
  validateEmail,
  validateApiKey,
  validatePromptInput,
  sanitizeInput,
  getRecoverySuggestions
} from '@/lib/errorHandling';
import { GeminiError, DriveError } from '@/types';

describe('Error Handling System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeError', () => {
    it('should normalize GeminiError correctly', () => {
      const geminiError = new GeminiError('INVALID_API_KEY', 'Invalid API key provided');
      const normalized = normalizeError(geminiError);

      expect(normalized.type).toBe(ErrorType.API);
      expect(normalized.code).toBe('INVALID_API_KEY');
      expect(normalized.retryable).toBe(false);
      expect(normalized.userMessage).toContain('Invalid API key');
    });

    it('should normalize DriveError correctly', () => {
      const driveError = new DriveError('UNAUTHORIZED', 'Drive access expired');
      const normalized = normalizeError(driveError);

      expect(normalized.type).toBe(ErrorType.API);
      expect(normalized.code).toBe('UNAUTHORIZED');
      expect(normalized.userMessage).toContain('Google Drive access expired');
    });

    it('should normalize network errors correctly', () => {
      const networkError = new TypeError('fetch failed');
      const normalized = normalizeError(networkError);

      expect(normalized.type).toBe(ErrorType.NETWORK);
      expect(normalized.retryable).toBe(true);
      expect(normalized.userMessage).toContain('internet connection');
    });

    it('should normalize authentication errors correctly', () => {
      const authError = new Error('401 Unauthorized');
      const normalized = normalizeError(authError);

      expect(normalized.type).toBe(ErrorType.AUTHENTICATION);
      expect(normalized.retryable).toBe(false);
      expect(normalized.userMessage).toContain('Authentication failed');
    });

    it('should normalize rate limit errors correctly', () => {
      const rateLimitError = new Error('429 Too Many Requests');
      const normalized = normalizeError(rateLimitError);

      expect(normalized.type).toBe(ErrorType.RATE_LIMIT);
      expect(normalized.retryable).toBe(true);
      expect(normalized.userMessage).toContain('Too many requests');
    });

    it('should handle unknown errors', () => {
      const unknownError = 'string error';
      const normalized = normalizeError(unknownError);

      expect(normalized.type).toBe(ErrorType.UNKNOWN);
      expect(normalized.retryable).toBe(false);
      expect(normalized.userMessage).toContain('Something went wrong');
    });
  });

  describe('createAppError', () => {
    it('should create AppError with all properties', () => {
      const error = createAppError(
        ErrorType.VALIDATION,
        'Test error',
        new Error('original'),
        {
          code: 'TEST_CODE',
          retryable: true,
          userMessage: 'Custom user message'
        }
      );

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.retryable).toBe(true);
      expect(error.userMessage).toBe('Custom user message');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('should use default user message when not provided', () => {
      const error = createAppError(ErrorType.NETWORK, 'Network failed');

      expect(error.userMessage).toContain('internet connection');
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 3, 100);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      // Create a retryable error (network error)
      const retryableError = new TypeError('fetch failed');
      const mockFn = vi.fn()
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 3, 10); // Shorter delay for tests
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new GeminiError('INVALID_API_KEY', 'Invalid key');
      const mockFn = vi.fn().mockRejectedValue(nonRetryableError);
      
      await expect(retryWithBackoff(mockFn, 3, 100)).rejects.toThrow(nonRetryableError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      // Create a retryable error that will keep failing
      const error = new TypeError('fetch failed');
      const mockFn = vi.fn().mockRejectedValue(error);
      
      await expect(retryWithBackoff(mockFn, 2, 10)).rejects.toThrow(error);
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Input Validation', () => {
    describe('validateEmail', () => {
      it('should validate correct email addresses', () => {
        expect(validateEmail('test@example.com')).toEqual({ isValid: true });
        expect(validateEmail('user.name+tag@domain.co.uk')).toEqual({ isValid: true });
      });

      it('should reject invalid email addresses', () => {
        expect(validateEmail('')).toEqual({ 
          isValid: false, 
          message: 'Email is required' 
        });
        expect(validateEmail('invalid-email')).toEqual({ 
          isValid: false, 
          message: 'Please enter a valid email address' 
        });
        expect(validateEmail('test@')).toEqual({ 
          isValid: false, 
          message: 'Please enter a valid email address' 
        });
      });
    });

    describe('validateApiKey', () => {
      it('should validate correct API keys', () => {
        expect(validateApiKey('AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX')).toEqual({ isValid: true });
        expect(validateApiKey('sk-test-1234567890abcdef')).toEqual({ isValid: true });
      });

      it('should reject invalid API keys', () => {
        expect(validateApiKey('')).toEqual({ 
          isValid: false, 
          message: 'API key is required' 
        });
        expect(validateApiKey('short')).toEqual({ 
          isValid: false, 
          message: 'API key appears to be too short' 
        });
        expect(validateApiKey('invalidformat')).toEqual({ 
          isValid: false, 
          message: 'API key format appears to be invalid' 
        });
      });
    });

    describe('validatePromptInput', () => {
      it('should validate correct prompt inputs', () => {
        expect(validatePromptInput('A beautiful sunset')).toEqual({ isValid: true });
        expect(validatePromptInput('Complex prompt with details')).toEqual({ isValid: true });
      });

      it('should reject invalid prompt inputs', () => {
        expect(validatePromptInput('')).toEqual({ 
          isValid: false, 
          message: 'Prompt input is required' 
        });
        
        const longInput = 'a'.repeat(2001);
        expect(validatePromptInput(longInput)).toEqual({ 
          isValid: false, 
          message: 'Prompt input is too long (maximum 2000 characters)' 
        });

        expect(validatePromptInput('<script>alert("xss")</script>')).toEqual({ 
          isValid: false, 
          message: 'Input contains potentially harmful content' 
        });
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should remove harmful content', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeInput('onclick="alert()"')).toBe('');
      expect(sanitizeInput('onload=malicious')).toBe('');
    });

    it('should trim and limit length', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      
      const longInput = 'a'.repeat(2001);
      const sanitized = sanitizeInput(longInput);
      expect(sanitized.length).toBe(2000);
    });

    it('should preserve normal content', () => {
      const normalInput = 'A beautiful sunset over the mountains';
      expect(sanitizeInput(normalInput)).toBe(normalInput);
    });
  });

  describe('getRecoverySuggestions', () => {
    it('should provide network error suggestions', () => {
      const error = createAppError(ErrorType.NETWORK, 'Network failed');
      const suggestions = getRecoverySuggestions(error);
      
      expect(suggestions).toContain('Check your internet connection');
      expect(suggestions).toContain('Try refreshing the page');
    });

    it('should provide API error suggestions', () => {
      const error = createAppError(ErrorType.API, 'API failed', undefined, { code: 'INVALID_API_KEY' });
      const suggestions = getRecoverySuggestions(error);
      
      expect(suggestions).toContain('Verify your API key is correct');
    });

    it('should provide authentication error suggestions', () => {
      const error = createAppError(ErrorType.AUTHENTICATION, 'Auth failed');
      const suggestions = getRecoverySuggestions(error);
      
      expect(suggestions).toContain('Sign out and sign in again');
    });

    it('should provide rate limit error suggestions', () => {
      const error = createAppError(ErrorType.RATE_LIMIT, 'Rate limited');
      const suggestions = getRecoverySuggestions(error);
      
      expect(suggestions).toContain('Wait a few minutes before trying again');
    });
  });
});

describe('Error Recovery', () => {
  it('should handle multiple error types in sequence', () => {
    const errors = [
      new GeminiError('RATE_LIMIT_EXCEEDED', 'Rate limit'),
      new DriveError('UNAUTHORIZED', 'Drive unauthorized'),
      new TypeError('fetch failed'),
      new Error('Unknown error')
    ];

    errors.forEach(error => {
      const normalized = normalizeError(error);
      expect(normalized).toHaveProperty('type');
      expect(normalized).toHaveProperty('userMessage');
      expect(typeof normalized.retryable).toBe('boolean');
    });
  });

  it('should provide appropriate user messages for all error types', () => {
    const errorTypes = Object.values(ErrorType);
    
    errorTypes.forEach(type => {
      const error = createAppError(type, 'Test message');
      expect(error.userMessage).toBeTruthy();
      expect(typeof error.userMessage).toBe('string');
      expect(error.userMessage.length).toBeGreaterThan(0);
    });
  });
});