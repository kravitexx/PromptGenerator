import { CustomFormat, ScaffoldSlot } from '@/types';
import { SCAFFOLD_SLOTS } from './scaffold';

/**
 * Validates a custom format template
 */
export function validateCustomFormat(format: CustomFormat): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if name is provided
  if (!format.name.trim()) {
    errors.push('Format name is required');
  }
  
  // Check if template is provided
  if (!format.template.trim()) {
    errors.push('Template string is required');
  }
  
  // Check if all 7 scaffold tokens are present
  const requiredTokens = SCAFFOLD_SLOTS.map(slot => `{${slot.key}}`);
  const missingTokens = requiredTokens.filter(token => 
    !format.template.includes(token)
  );
  
  if (missingTokens.length > 0) {
    errors.push(`Missing required tokens: ${missingTokens.join(', ')}`);
  }
  
  // Check for unknown tokens
  const tokenPattern = /\{([^}]+)\}/g;
  const foundTokens = [...format.template.matchAll(tokenPattern)].map(match => match[1]);
  const validTokens = SCAFFOLD_SLOTS.map(slot => slot.key);
  const unknownTokens = foundTokens.filter(token => !validTokens.includes(token as ScaffoldSlot['key']));
  
  if (unknownTokens.length > 0) {
    warnings.push(`Unknown tokens found: ${unknownTokens.map(t => `{${t}}`).join(', ')}`);
  }
  
  // Check template length
  if (format.template.length > 1000) {
    warnings.push('Template is very long and may cause issues');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates API key format (basic validation)
 */
export function validateApiKey(apiKey: string): {
  isValid: boolean;
  error?: string;
} {
  if (!apiKey.trim()) {
    return { isValid: false, error: 'API key is required' };
  }
  
  if (apiKey.length < 10) {
    return { isValid: false, error: 'API key appears to be too short' };
  }
  
  // Basic format check for Gemini API keys
  if (!apiKey.startsWith('AI') && !apiKey.includes('-')) {
    return { isValid: false, error: 'API key format appears invalid' };
  }
  
  return { isValid: true };
}

/**
 * Validates image file
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please use JPEG, PNG, or WebP images.' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'File size too large. Please use images smaller than 10MB.' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates prompt content for safety and quality
 */
export function validatePromptContent(content: string): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check for potentially problematic content
  const problematicKeywords = [
    'nsfw', 'explicit', 'nude', 'naked', 'sexual', 'violence', 'blood', 'gore'
  ];
  
  const lowerContent = content.toLowerCase();
  const foundProblematic = problematicKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  if (foundProblematic.length > 0) {
    warnings.push('Content may be flagged by AI safety filters');
  }
  
  // Check prompt length
  if (content.length < 10) {
    suggestions.push('Consider adding more detail to your prompt');
  }
  
  if (content.length > 500) {
    suggestions.push('Very long prompts may not work well with some models');
  }
  
  // Check for common issues
  if (content.includes('...')) {
    suggestions.push('Replace "..." with specific details');
  }
  
  if (!/[.!?]$/.test(content.trim())) {
    suggestions.push('Consider ending your prompt with punctuation');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates scaffold slot content
 */
export function validateScaffoldSlot(slot: ScaffoldSlot): {
  isValid: boolean;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  
  if (!slot.content.trim()) {
    suggestions.push(`Add content to the ${slot.name} slot`);
    return { isValid: false, suggestions };
  }
  
  // Slot-specific validation
  switch (slot.key) {
    case 'S': // Subject
      if (slot.content.length < 3) {
        suggestions.push('Subject should be more descriptive');
      }
      break;
      
    case 'Q': // Quality
      const qualityKeywords = ['quality', 'detailed', '4k', '8k', 'sharp', 'professional'];
      const hasQualityKeywords = qualityKeywords.some(keyword => 
        slot.content.toLowerCase().includes(keyword)
      );
      if (!hasQualityKeywords) {
        suggestions.push('Consider adding quality descriptors like "high quality" or "detailed"');
      }
      break;
      
    case 'St': // Style
      if (slot.content.length < 5) {
        suggestions.push('Style description could be more specific');
      }
      break;
  }
  
  return {
    isValid: true,
    suggestions,
  };
}

/**
 * Validates that required environment variables are present
 */
export function validateEnvironment(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !process.env[varName]
  );
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}