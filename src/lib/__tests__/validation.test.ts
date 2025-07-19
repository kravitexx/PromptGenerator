import { describe, it, expect } from 'vitest';
import { 
  validateApiKey,
  validateImageFile,
  validatePromptContent,
  sanitizeInput,
  validateCustomFormat,
  validateScaffoldSlot
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateApiKey', () => {
    it('should validate correct API key format', () => {
      const validKey = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      const result = validateApiKey(validKey);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid API key format', () => {
      expect(validateApiKey('').isValid).toBe(false);
      expect(validateApiKey('short').isValid).toBe(false); // too short
      expect(validateApiKey('AIzaSy').isValid).toBe(false); // too short
    });

    it('should handle empty input', () => {
      const result = validateApiKey('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('API key is required');
    });
  });

  describe('validateImageFile', () => {
    it('should validate supported image types', () => {
      const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(validateImageFile(validFile).isValid).toBe(true);

      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      expect(validateImageFile(pngFile).isValid).toBe(true);

      const webpFile = new File([''], 'test.webp', { type: 'image/webp' });
      expect(validateImageFile(webpFile).isValid).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      const result = validateImageFile(textFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');

      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(validateImageFile(pdfFile).isValid).toBe(false);
    });

    it('should reject files that are too large', () => {
      // Create a mock file that's too large (>10MB)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      const result = validateImageFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size too large');
    });
  });

  describe('validatePromptContent', () => {
    it('should validate proper prompt input', () => {
      const validPrompt = 'Create a beautiful sunset scene.';
      const result = validatePromptContent(validPrompt);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should provide suggestions for short prompts', () => {
      const result = validatePromptContent('hi');
      
      expect(result.suggestions).toContain('Consider adding more detail to your prompt');
    });

    it('should warn about very long prompts', () => {
      const longPrompt = 'x'.repeat(501);
      const result = validatePromptContent(longPrompt);
      
      expect(result.suggestions).toContain('Very long prompts may not work well with some models');
    });

    it('should detect potentially problematic content', () => {
      const problematicPrompt = 'Create explicit content with violence';
      const result = validatePromptContent(problematicPrompt);
      
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Content may be flagged by AI safety filters');
    });

    it('should suggest punctuation', () => {
      const result = validatePromptContent('A beautiful sunset');
      
      expect(result.suggestions).toContain('Consider ending your prompt with punctuation');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello world';
      const result = sanitizeInput(input);
      
      expect(result).toBe('scriptalert("xss")/scriptHello world');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  Hello world  ';
      const result = sanitizeInput(input);
      
      expect(result).toBe('Hello world');
    });

    it('should handle special characters safely', () => {
      const input = 'Hello & goodbye "quotes" \'apostrophes\'';
      const result = sanitizeInput(input);
      
      expect(result).toContain('Hello');
      expect(result).toContain('goodbye');
      expect(result).toContain('quotes');
      expect(result).toContain('apostrophes');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should remove javascript protocols', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('javascript:');
    });
  });

  describe('validateCustomFormat', () => {
    it('should validate correct custom format', () => {
      const validFormat = {
        id: 'test',
        name: 'Test Format',
        template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
        description: 'Test format',
        isBuiltIn: false
      };
      
      const result = validateCustomFormat(validFormat);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required tokens', () => {
      const invalidFormat = {
        id: 'test',
        name: 'Test Format',
        template: '{S}, {C}', // Missing required tokens
        description: 'Test format',
        isBuiltIn: false
      };
      
      const result = validateCustomFormat(invalidFormat);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing required tokens'))).toBe(true);
    });

    it('should require name and template', () => {
      const invalidFormat = {
        id: 'test',
        name: '',
        template: '',
        description: 'Test format',
        isBuiltIn: false
      };
      
      const result = validateCustomFormat(invalidFormat);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format name is required');
      expect(result.errors).toContain('Template string is required');
    });
  });

  describe('validateScaffoldSlot', () => {
    it('should validate slot with content', () => {
      const slot = {
        key: 'S' as const,
        name: 'Subject',
        content: 'A beautiful sunset',
        required: true
      };
      
      const result = validateScaffoldSlot(slot);
      
      expect(result.isValid).toBe(true);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should detect empty slots', () => {
      const slot = {
        key: 'S' as const,
        name: 'Subject',
        content: '',
        required: true
      };
      
      const result = validateScaffoldSlot(slot);
      
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain('Add content to the Subject slot');
    });

    it('should provide quality suggestions', () => {
      const slot = {
        key: 'Q' as const,
        name: 'Quality',
        content: 'nice',
        required: false
      };
      
      const result = validateScaffoldSlot(slot);
      
      expect(result.isValid).toBe(true);
      expect(result.suggestions.some(s => s.includes('quality descriptors'))).toBe(true);
    });
  });
});