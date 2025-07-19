import { DriveError, GeminiError } from '@/types';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  code?: string;
  retryable?: boolean;
  userMessage?: string;
}

// Create standardized error objects
export function createAppError(
  type: ErrorType,
  message: string,
  originalError?: Error,
  options?: {
    code?: string;
    retryable?: boolean;
    userMessage?: string;
  }
): AppError {
  return {
    type,
    message,
    originalError,
    code: options?.code,
    retryable: options?.retryable ?? false,
    userMessage: options?.userMessage ?? getUserFriendlyMessage(type, message),
  };
}

// Convert various error types to standardized AppError
export function normalizeError(error: unknown): AppError {
  if (error instanceof GeminiError) {
    return createAppError(
      ErrorType.API,
      error.message,
      error,
      {
        code: error.code,
        retryable: isRetryableGeminiError(error.code),
        userMessage: getGeminiErrorMessage(error.code),
      }
    );
  }

  if (error instanceof DriveError) {
    return createAppError(
      ErrorType.API,
      error.message,
      error,
      {
        code: error.code,
        retryable: isRetryableDriveError(error.code),
        userMessage: getDriveErrorMessage(error.code),
      }
    );
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAppError(
      ErrorType.NETWORK,
      'Network request failed',
      error as Error,
      {
        retryable: true,
        userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      }
    );
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return createAppError(
        ErrorType.AUTHENTICATION,
        error.message,
        error,
        {
          retryable: false,
          userMessage: 'Authentication failed. Please sign in again.',
        }
      );
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return createAppError(
        ErrorType.PERMISSION,
        error.message,
        error,
        {
          retryable: false,
          userMessage: 'You do not have permission to perform this action.',
        }
      );
    }

    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return createAppError(
        ErrorType.RATE_LIMIT,
        error.message,
        error,
        {
          retryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.',
        }
      );
    }

    return createAppError(
      ErrorType.UNKNOWN,
      error.message,
      error,
      {
        retryable: false,
      }
    );
  }

  return createAppError(
    ErrorType.UNKNOWN,
    'An unexpected error occurred',
    undefined,
    {
      retryable: false,
      userMessage: 'Something went wrong. Please try again.',
    }
  );
}

// Get user-friendly error messages
function getUserFriendlyMessage(type: ErrorType, message: string): string {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case ErrorType.API:
      return 'There was a problem with the service. Please try again in a moment.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication failed. Please sign in again.';
    case ErrorType.PERMISSION:
      return 'You do not have permission to perform this action.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// Gemini-specific error handling
function isRetryableGeminiError(code: string): boolean {
  const retryableCodes = ['RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR', 'SERVICE_UNAVAILABLE'];
  return retryableCodes.includes(code);
}

function getGeminiErrorMessage(code: string): string {
  switch (code) {
    case 'INVALID_API_KEY':
      return 'Invalid API key. Please check your Gemini API key and try again.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'API rate limit exceeded. Please wait a moment and try again.';
    case 'QUOTA_EXCEEDED':
      return 'API quota exceeded. Please check your Gemini API usage.';
    case 'INVALID_REQUEST':
      return 'Invalid request. Please check your input and try again.';
    case 'CONTENT_FILTERED':
      return 'Content was filtered. Please modify your input and try again.';
    case 'MODEL_NOT_FOUND':
      return 'The requested AI model is not available.';
    case 'INTERNAL_ERROR':
      return 'Internal server error. Please try again in a moment.';
    case 'SERVICE_UNAVAILABLE':
      return 'Service is temporarily unavailable. Please try again later.';
    default:
      return 'There was a problem with the AI service. Please try again.';
  }
}

// Drive-specific error handling
function isRetryableDriveError(code: string): boolean {
  const retryableCodes = ['RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR', 'SERVICE_UNAVAILABLE'];
  return retryableCodes.includes(code);
}

function getDriveErrorMessage(code: string): string {
  switch (code) {
    case 'NO_TOKEN':
      return 'Google Drive is not connected. Please connect your Google Drive account.';
    case 'UNAUTHORIZED':
      return 'Google Drive access expired. Please reconnect your account.';
    case 'FORBIDDEN':
      return 'Insufficient Google Drive permissions. Please reconnect with proper permissions.';
    case 'NOT_FOUND':
      return 'File not found in Google Drive.';
    case 'QUOTA_EXCEEDED':
      return 'Google Drive storage quota exceeded.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Google Drive rate limit exceeded. Please wait and try again.';
    default:
      return 'There was a problem with Google Drive. Please try again.';
  }
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      const appError = normalizeError(error);
      
      // Don't retry if error is not retryable or we've reached max attempts
      if (!appError.retryable || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 100,
        maxDelay
      );

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Input validation utilities
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

export function validateApiKey(apiKey: string): { isValid: boolean; message?: string } {
  if (!apiKey.trim()) {
    return { isValid: false, message: 'API key is required' };
  }
  
  if (apiKey.length < 10) {
    return { isValid: false, message: 'API key appears to be too short' };
  }
  
  // Basic format validation for Gemini API keys
  if (!apiKey.startsWith('AI') && !apiKey.includes('-')) {
    return { isValid: false, message: 'API key format appears to be invalid' };
  }
  
  return { isValid: true };
}

export function validatePromptInput(input: string): { isValid: boolean; message?: string } {
  if (!input.trim()) {
    return { isValid: false, message: 'Prompt input is required' };
  }
  
  if (input.length > 2000) {
    return { isValid: false, message: 'Prompt input is too long (maximum 2000 characters)' };
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /script\s*>/i,
    /<\s*iframe/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, message: 'Input contains potentially harmful content' };
    }
  }
  
  return { isValid: true };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers with quotes
    .replace(/on\w+\s*=\s*[^"'\s]+/gi, '') // Remove event handlers without quotes
    .substring(0, 2000); // Limit length
}

// Log errors for monitoring
export function logError(error: AppError, context?: Record<string, unknown>) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: error.type,
    message: error.message,
    code: error.code,
    retryable: error.retryable,
    context,
    stack: error.originalError?.stack,
  };

  console.error('Application Error:', logData);

  // In production, send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to logging service
    // loggingService.error(logData);
  }
}

// Error recovery suggestions
export function getRecoverySuggestions(error: AppError): string[] {
  const suggestions: string[] = [];

  switch (error.type) {
    case ErrorType.NETWORK:
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
      suggestions.push('Disable any VPN or proxy');
      break;
    case ErrorType.API:
      suggestions.push('Wait a moment and try again');
      suggestions.push('Check if the service is experiencing issues');
      if (error.code === 'INVALID_API_KEY') {
        suggestions.push('Verify your API key is correct');
      }
      break;
    case ErrorType.AUTHENTICATION:
      suggestions.push('Sign out and sign in again');
      suggestions.push('Clear your browser cache');
      break;
    case ErrorType.VALIDATION:
      suggestions.push('Check your input for errors');
      suggestions.push('Make sure all required fields are filled');
      break;
    case ErrorType.RATE_LIMIT:
      suggestions.push('Wait a few minutes before trying again');
      suggestions.push('Reduce the frequency of your requests');
      break;
    default:
      suggestions.push('Try refreshing the page');
      suggestions.push('Contact support if the problem persists');
  }

  return suggestions;
}