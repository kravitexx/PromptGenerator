import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  validateCustomFormat,
  formatPromptWithCustomFormat,
  createDefaultCustomFormat,
  exportCustomFormats,
  importCustomFormats,
  getFormatUsageStats
} from '@/lib/customFormats';
import { CustomFormat } from '@/types';
import { SCAFFOLD_SLOTS } from '@/lib/scaffold';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Custom Format System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Format Validation', () => {
    it('should validate a correct format template', () => {
      const template = '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}';
      const validation = validateCustomFormat(template);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.missingTokens).toHaveLength(0);
      expect(validation.invalidTokens).toHaveLength(0);
    });

    it('should detect missing required tokens', () => {
      const template = '{S}, {C}, {St}'; // Missing Co, L, A, Q
      const validation = validateCustomFormat(template);

      expect(validation.isValid).toBe(false);
      expect(validation.missingTokens).toContain('{Co}');
      expect(validation.missingTokens).toContain('{L}');
      expect(validation.missingTokens).toContain('{A}');
      expect(validation.missingTokens).toContain('{Q}');
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid tokens', () => {
      const template = '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}, {INVALID}';
      const validation = validateCustomFormat(template);

      expect(validation.isValid).toBe(false);
      expect(validation.invalidTokens).toContain('{INVALID}');
      expect(validation.errors.some(e => e.includes('Invalid tokens'))).toBe(true);
    });

    it('should reject empty templates', () => {
      const validation = validateCustomFormat('');

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('empty'))).toBe(true);
    });

    it('should handle complex template formats', () => {
      const template = 'A {St} image of {S} in {C}. Shot with {Co} using {L}. The {A} is enhanced by {Q}.';
      const validation = validateCustomFormat(template);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Format Application', () => {
    const sampleFormat: CustomFormat = {
      id: 'test-format',
      name: 'Test Format',
      template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
      validation: true,
      slots: SCAFFOLD_SLOTS
    };

    const sampleScaffoldData = {
      S: 'a dragon',
      C: 'medieval castle',
      St: 'digital art',
      Co: 'wide shot',
      L: 'golden hour',
      A: 'epic atmosphere',
      Q: 'high quality'
    };

    it('should format prompt with custom template', () => {
      const result = formatPromptWithCustomFormat(sampleScaffoldData, sampleFormat);
      
      expect(result).toBe('a dragon, medieval castle, digital art, wide shot, golden hour, epic atmosphere, high quality');
    });

    it('should handle natural language templates', () => {
      const naturalFormat: CustomFormat = {
        ...sampleFormat,
        template: 'A {St} image of {S} in {C}. The composition shows {Co} with {L}. The overall {A} is enhanced by {Q}.'
      };

      const result = formatPromptWithCustomFormat(sampleScaffoldData, naturalFormat);
      
      expect(result).toContain('A digital art image of a dragon');
      expect(result).toContain('in medieval castle');
      expect(result).toContain('wide shot with golden hour');
    });

    it('should handle parameter-style templates', () => {
      const paramFormat: CustomFormat = {
        ...sampleFormat,
        template: '{S} --style {St} --composition {Co} --lighting {L} --mood {A} --quality {Q} --context {C}'
      };

      const result = formatPromptWithCustomFormat(sampleScaffoldData, paramFormat);
      
      expect(result).toContain('a dragon --style digital art');
      expect(result).toContain('--composition wide shot');
      expect(result).toContain('--lighting golden hour');
    });

    it('should handle empty scaffold values', () => {
      const emptyScaffoldData = {
        S: 'a dragon',
        C: '',
        St: '',
        Co: '',
        L: '',
        A: '',
        Q: ''
      };

      const result = formatPromptWithCustomFormat(emptyScaffoldData, sampleFormat);
      
      expect(result).toBe('a dragon');
      expect(result).not.toContain(',,');
    });

    it('should clean up formatting artifacts', () => {
      const messyScaffoldData = {
        S: '',
        C: 'castle',
        St: '',
        Co: 'wide shot',
        L: '',
        A: '',
        Q: 'high quality'
      };

      const result = formatPromptWithCustomFormat(messyScaffoldData, sampleFormat);
      
      expect(result).toBe('castle, wide shot, high quality');
      expect(result).not.toMatch(/^,|,$|,,/); // No leading/trailing commas or double commas
    });
  });

  describe('Default Format Creation', () => {
    it('should create a valid default format', () => {
      const defaultFormat = createDefaultCustomFormat();

      expect(defaultFormat.template).toBeDefined();
      expect(defaultFormat.slots).toHaveLength(7);
      expect(defaultFormat.validation).toBe(true);
      
      const validation = validateCustomFormat(defaultFormat.template!);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Import/Export', () => {
    const sampleFormats: CustomFormat[] = [
      {
        id: 'format-1',
        name: 'Format 1',
        template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
        validation: true,
        slots: SCAFFOLD_SLOTS
      },
      {
        id: 'format-2',
        name: 'Format 2',
        template: 'A {St} image of {S} in {C} with {L}, {Co}, {A}, {Q}',
        validation: true,
        slots: SCAFFOLD_SLOTS
      }
    ];

    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleFormats));
    });

    it('should export formats to JSON', () => {
      const exported = exportCustomFormats();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Format 1');
      expect(parsed[1].name).toBe('Format 2');
    });

    it('should import valid formats', () => {
      const jsonData = JSON.stringify(sampleFormats);
      const result = importCustomFormats(jsonData);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid format data', () => {
      const invalidData = JSON.stringify([
        {
          id: 'invalid',
          name: 'Invalid Format',
          template: '{S}, {INVALID}' // Missing required tokens and invalid token
        }
      ]);

      const result = importCustomFormats(invalidData);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle malformed JSON', () => {
      const result = importCustomFormats('invalid json');

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should handle non-array data', () => {
      const result = importCustomFormats('{"not": "an array"}');

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.some(e => e.includes('expected an array'))).toBe(true);
    });
  });

  describe('Usage Statistics', () => {
    it('should calculate format usage statistics', () => {
      const mixedFormats = [
        {
          id: 'valid-1',
          name: 'Valid Format 1',
          template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
          validation: true,
          slots: SCAFFOLD_SLOTS
        },
        {
          id: 'valid-2',
          name: 'Valid Format 2',
          template: 'A {St} image of {S} in {C} with {L}, {Co}, {A}, {Q}',
          validation: true,
          slots: SCAFFOLD_SLOTS
        },
        {
          id: 'invalid-1',
          name: 'Invalid Format',
          template: '{S}, {INVALID}', // Missing tokens
          validation: false,
          slots: SCAFFOLD_SLOTS
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedFormats));

      const stats = getFormatUsageStats();

      expect(stats.totalFormats).toBe(3);
      expect(stats.validFormats).toBe(2);
      expect(stats.invalidFormats).toBe(1);
    });

    it('should handle empty format list', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const stats = getFormatUsageStats();

      expect(stats.totalFormats).toBe(0);
      expect(stats.validFormats).toBe(0);
      expect(stats.invalidFormats).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw and return empty array
      expect(() => {
        const stats = getFormatUsageStats();
        expect(stats.totalFormats).toBe(0);
      }).not.toThrow();
    });

    it('should handle malformed stored data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => {
        const stats = getFormatUsageStats();
        expect(stats.totalFormats).toBe(0);
      }).not.toThrow();
    });

    it('should validate complex nested templates', () => {
      const complexTemplate = '{"subject": "{S}", "context": "{C}", "style": "{St}", "composition": "{Co}", "lighting": "{L}", "atmosphere": "{A}", "quality": "{Q}"}';

      const validation = validateCustomFormat(complexTemplate);
      expect(validation.isValid).toBe(true);
    });
  });
});