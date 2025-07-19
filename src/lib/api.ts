import { getStoredApiKey } from '@/lib/gemini';
import { GeminiError } from '@/types';
import { retryWithBackoff, normalizeError, validatePromptInput, sanitizeInput, logError, AppError } from '@/lib/errorHandling';

// API client configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

/**
 * Makes a request to generate an enhanced prompt with comprehensive error handling
 */
export async function generatePrompt(
  prompt: string,
  images?: string[]
): Promise<{
  generatedPrompt: unknown;
  originalInput: string;
  enhancedText: string;
  suggestions: string[];
  clarifyingQuestions: unknown[];
}> {
  // Validate and sanitize input
  const validation = validatePromptInput(prompt);
  if (!validation.isValid) {
    const error = normalizeError(new Error(validation.message));
    logError(error, { input: prompt.substring(0, 100) });
    throw error;
  }

  const sanitizedPrompt = sanitizeInput(prompt);
  const apiKey = getStoredApiKey();
  
  if (!apiKey) {
    const error = new GeminiError('MISSING_API_KEY', 'No API key found. Please configure your Gemini API key.');
    logError(normalizeError(error));
    throw error;
  }

  try {
    return await retryWithBackoff(async () => {
      const response = await fetch(`${API_BASE_URL}/api/gemini/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: sanitizedPrompt,
          images: images || [],
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GeminiError(
          errorData.code || 'API_ERROR',
          errorData.error || 'Failed to generate prompt',
          errorData.details
        );
      }

      const data = await response.json();
      
      // Validate response structure
      if (!validateApiResponse(data, ['data'])) {
        throw new GeminiError('INVALID_RESPONSE', 'Invalid response format from API');
      }
      
      return data.data;
    }, 3, 1000, 5000);
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError, { 
      input: sanitizedPrompt.substring(0, 100),
      hasImages: Boolean(images?.length)
    });
    throw appError;
  }
}

/**
 * Makes a request to analyze an image with comprehensive error handling
 */
export async function analyzeImage(
  image: string,
  originalPrompt: string
): Promise<{
  description: string;
  tokenComparison: unknown[];
  suggestions: string[];
}> {
  // Validate inputs
  if (!image || !image.trim()) {
    const error = normalizeError(new Error('Image data is required'));
    logError(error);
    throw error;
  }

  const validation = validatePromptInput(originalPrompt);
  if (!validation.isValid) {
    const error = normalizeError(new Error(validation.message));
    logError(error, { prompt: originalPrompt.substring(0, 100) });
    throw error;
  }

  const sanitizedPrompt = sanitizeInput(originalPrompt);
  const apiKey = getStoredApiKey();
  
  if (!apiKey) {
    const error = new GeminiError('MISSING_API_KEY', 'No API key found. Please configure your Gemini API key.');
    logError(normalizeError(error));
    throw error;
  }

  try {
    return await retryWithBackoff(async () => {
      const response = await fetch(`${API_BASE_URL}/api/gemini/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          originalPrompt: sanitizedPrompt,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GeminiError(
          errorData.code || 'API_ERROR',
          errorData.error || 'Failed to analyze image',
          errorData.details
        );
      }

      const data = await response.json();
      
      // Validate response structure
      if (!validateApiResponse(data, ['data'])) {
        throw new GeminiError('INVALID_RESPONSE', 'Invalid response format from API');
      }
      
      return data.data;
    }, 3, 1000, 5000);
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError, { 
      prompt: sanitizedPrompt.substring(0, 100),
      hasImage: Boolean(image)
    });
    throw appError;
  }
}

/**
 * Enhanced API error handler using the comprehensive error handling system
 */
export function handleApiError(error: unknown): string {
  const appError = normalizeError(error);
  logError(appError);
  return appError.userMessage || appError.message;
}

/**
 * Get a normalized AppError from any error
 */
export function getAppError(error: unknown): AppError {
  return normalizeError(error);
}

/**
 * Validates API response structure
 */
export function validateApiResponse(data: unknown, requiredFields: string[]): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  return requiredFields.every(field => field in data);
}

/**
 * Creates a retry wrapper for API calls
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication errors
      if (error instanceof GeminiError && error.code === 'MISSING_API_KEY') {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
}

/**
 * Checks if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch {
    return false;
  }
}