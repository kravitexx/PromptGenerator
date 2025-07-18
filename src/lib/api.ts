import { getStoredApiKey } from '@/lib/gemini';
import { GeminiError } from '@/types';

// API client configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

/**
 * Makes a request to generate an enhanced prompt
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
  const apiKey = getStoredApiKey();
  
  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'No API key found. Please configure your Gemini API key.');
  }

  const response = await fetch(`${API_BASE_URL}/api/gemini/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      images: images || [],
      apiKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new GeminiError(
      errorData.code || 'API_ERROR',
      errorData.error || 'Failed to generate prompt',
      errorData.details
    );
  }

  const data = await response.json();
  return data.data;
}

/**
 * Makes a request to analyze an image
 */
export async function analyzeImage(
  image: string,
  originalPrompt: string
): Promise<{
  description: string;
  tokenComparison: unknown[];
  suggestions: string[];
}> {
  const apiKey = getStoredApiKey();
  
  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'No API key found. Please configure your Gemini API key.');
  }

  const response = await fetch(`${API_BASE_URL}/api/gemini/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image,
      originalPrompt,
      apiKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new GeminiError(
      errorData.code || 'API_ERROR',
      errorData.error || 'Failed to analyze image',
      errorData.details
    );
  }

  const data = await response.json();
  return data.data;
}

/**
 * Generic API error handler
 */
export function handleApiError(error: unknown): string {
  if (error instanceof GeminiError) {
    switch (error.code) {
      case 'MISSING_API_KEY':
        return 'API key is missing. Please configure your Gemini API key.';
      case 'API_ERROR':
        return `API Error: ${error.message}`;
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'NO_RESPONSE':
        return 'No response from AI. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
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