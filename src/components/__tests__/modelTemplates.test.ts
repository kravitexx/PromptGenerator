import { describe, it, expect } from 'vitest';
import { 
  getAllTemplates, 
  getTemplateById, 
  formatPromptForModel,
  validateTemplateFormat 
} from '@/lib/modelTemplates';
import { scaffoldToObject } from '@/lib/scaffold';
import { analyzeInputAndPopulateScaffold } from '@/lib/promptBuilder';

describe('Model Templates System', () => {
  describe('Template Management', () => {
    it('should return all available templates', () => {
      const templates = getAllTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBe(5); // SD3.5, Midjourney, DALL-E, Imagen, Flux
      
      // Check required template properties
      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.format).toBeDefined();
        expect(template.negativeFormat).toBeDefined();
      });
    });

    it('should retrieve specific templates by ID', () => {
      const sdTemplate = getTemplateById('stable-diffusion-3.5');
      const mjTemplate = getTemplateById('midjourney-v6');
      const dalleTemplate = getTemplateById('dalle-3');
      
      expect(sdTemplate?.name).toBe('Stable Diffusion 3.5');
      expect(mjTemplate?.name).toBe('Midjourney v6');
      expect(dalleTemplate?.name).toBe('DALL·E 3');
    });

    it('should return null for invalid template IDs', () => {
      const invalidTemplate = getTemplateById('non-existent-model');
      expect(invalidTemplate).toBeNull();
    });

    it('should have unique template IDs', () => {
      const templates = getAllTemplates();
      const ids = templates.map(t => t.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('Template Formatting', () => {
    const testScaffold = scaffoldToObject(
      analyzeInputAndPopulateScaffold('A majestic dragon flying over a medieval castle at sunset')
    );

    it('should format prompts for Stable Diffusion 3.5', () => {
      const template = getTemplateById('stable-diffusion-3.5')!;
      const formatted = formatPromptForModel(testScaffold, template);
      
      expect(formatted).toContain('dragon');
      expect(formatted).toContain('castle');
      expect(formatted).toContain(','); // Comma-separated format
      
      // Test with negative prompt
      const withNegative = formatPromptForModel(testScaffold, template, 'blurry, low quality');
      expect(withNegative).toContain('NEG=');
      expect(withNegative).toContain('blurry');
    });

    it('should format prompts for Midjourney v6', () => {
      const template = getTemplateById('midjourney-v6')!;
      const formatted = formatPromptForModel(testScaffold, template);
      
      expect(formatted).toContain('dragon');
      expect(formatted).toContain('castle');
      
      // Test with negative prompt and parameters
      const withNegative = formatPromptForModel(testScaffold, template, 'cartoon, anime');
      expect(withNegative).toContain('--no cartoon');
      expect(withNegative).toContain('--v 6');
      expect(withNegative).toContain('--ar');
    });

    it('should format prompts for DALL-E 3', () => {
      const template = getTemplateById('dalle-3')!;
      const formatted = formatPromptForModel(testScaffold, template);
      
      expect(formatted).toContain('Illustration of');
      expect(formatted).toContain('dragon');
      expect(formatted).toContain('castle');
      
      // DALL-E uses natural language format
      expect(formatted).toContain('.');
      
      // Test with negative prompt (integrated into description)
      const withNegative = formatPromptForModel(testScaffold, template, 'cartoon style');
      expect(withNegative).toContain('Avoid:');
      expect(withNegative).toContain('cartoon style');
    });

    it('should format prompts for Imagen 3', () => {
      const template = getTemplateById('imagen-3')!;
      const formatted = formatPromptForModel(testScaffold, template);
      
      // Imagen uses JSON format
      expect(() => JSON.parse(formatted)).not.toThrow();
      
      const parsed = JSON.parse(formatted);
      expect(parsed.text).toBeDefined();
      expect(parsed.text).toContain('dragon');
      
      // Test with negative prompt
      const withNegative = formatPromptForModel(testScaffold, template, 'low quality');
      const parsedNegative = JSON.parse(withNegative);
      expect(parsedNegative.negative_text).toBe('low quality');
    });

    it('should format prompts for Flux v9', () => {
      const template = getTemplateById('flux-v9')!;
      const formatted = formatPromptForModel(testScaffold, template);
      
      expect(formatted).toContain('|'); // Pipe-separated format
      expect(formatted).toContain('dragon');
      expect(formatted).toContain('castle');
      
      // Test with negative prompt
      const withNegative = formatPromptForModel(testScaffold, template, 'blurry');
      expect(withNegative).toContain('avoid="blurry"');
    });

    it('should handle empty scaffold gracefully', () => {
      const emptyScaffold = {
        S: '', C: '', St: '', Co: '', L: '', A: '', Q: ''
      };
      
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        const formatted = formatPromptForModel(emptyScaffold, template);
        expect(formatted).toBeDefined();
        expect(typeof formatted).toBe('string');
        
        // Should not contain undefined or null
        expect(formatted).not.toContain('undefined');
        expect(formatted).not.toContain('null');
      });
    });

    it('should preserve special characters in scaffold content', () => {
      const specialScaffold = {
        S: 'robot-warrior',
        C: 'cyber-punk city',
        St: 'neo-noir style',
        Co: 'wide-angle shot',
        L: 'neon lighting',
        A: 'dark & moody',
        Q: 'ultra-high quality'
      };
      
      const template = getTemplateById('stable-diffusion-3.5')!;
      const formatted = formatPromptForModel(specialScaffold, template);
      
      expect(formatted).toContain('robot-warrior');
      expect(formatted).toContain('cyber-punk');
      expect(formatted).toContain('&');
      expect(formatted).toContain('-');
    });
  });

  describe('Template Validation', () => {
    it('should validate correct template formats', () => {
      const validTemplate = {
        id: 'test-model',
        name: 'Test Model',
        format: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
        negativeFormat: 'NEG="{neg}"'
      };
      
      const validation = validateTemplateFormat(validTemplate);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing scaffold tokens', () => {
      const invalidTemplate = {
        id: 'incomplete-model',
        name: 'Incomplete Model',
        format: '{S}, {C}', // Missing tokens
        negativeFormat: 'NEG="{neg}"'
      };
      
      const validation = validateTemplateFormat(invalidTemplate);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes('missing'))).toBe(true);
    });

    it('should detect invalid template structure', () => {
      const invalidTemplate = {
        id: '',
        name: '',
        format: '',
        negativeFormat: ''
      };
      
      const validation = validateTemplateFormat(invalidTemplate);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate all built-in templates', () => {
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        const validation = validateTemplateFormat(template);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });
  });

  describe('Template Parameters', () => {
    it('should handle template parameters correctly', () => {
      const template = getTemplateById('midjourney-v6')!;
      
      // Check if template has parameters
      if (template.parameters) {
        expect(template.parameters).toBeInstanceOf(Object);
      }
      
      // Test parameter substitution in formatting
      const scaffold = scaffoldToObject(
        analyzeInputAndPopulateScaffold('A simple test')
      );
      
      const formatted = formatPromptForModel(scaffold, template);
      
      // Should contain version parameter
      expect(formatted).toContain('--v 6');
    });

    it('should handle aspect ratio parameters', () => {
      const template = getTemplateById('midjourney-v6')!;
      const scaffold = scaffoldToObject(
        analyzeInputAndPopulateScaffold('A landscape scene')
      );
      
      const formatted = formatPromptForModel(scaffold, template);
      
      // Should include aspect ratio
      expect(formatted).toContain('--ar');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long scaffold content', () => {
      const longScaffold = {
        S: 'A very detailed and complex subject with many descriptive elements that should be preserved in the final output',
        C: 'An elaborate context with multiple environmental factors and situational details',
        St: 'A sophisticated artistic style with specific technical requirements and aesthetic preferences',
        Co: 'A complex composition with multiple focal points and advanced framing techniques',
        L: 'Intricate lighting setup with multiple sources and advanced illumination techniques',
        A: 'A rich atmospheric description with detailed mood and environmental characteristics',
        Q: 'Extremely high quality requirements with specific technical specifications and output criteria'
      };
      
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        const formatted = formatPromptForModel(longScaffold, template);
        expect(formatted.length).toBeGreaterThan(100);
        expect(formatted).toContain('detailed');
        expect(formatted).toContain('complex');
      });
    });

    it('should handle special Unicode characters', () => {
      const unicodeScaffold = {
        S: 'café ñoño',
        C: 'résumé naïve',
        St: 'Москва 北京',
        Co: '🎨 🖼️',
        L: 'été hiver',
        A: 'très bien',
        Q: 'qualité supérieure'
      };
      
      const template = getTemplateById('stable-diffusion-3.5')!;
      const formatted = formatPromptForModel(unicodeScaffold, template);
      
      expect(formatted).toContain('café');
      expect(formatted).toContain('ñoño');
      expect(formatted).toContain('🎨');
    });

    it('should handle null and undefined values in scaffold', () => {
      const problematicScaffold = {
        S: 'valid subject',
        C: null as any,
        St: undefined as any,
        Co: '',
        L: 'valid lighting',
        A: null as any,
        Q: undefined as any
      };
      
      const template = getTemplateById('stable-diffusion-3.5')!;
      const formatted = formatPromptForModel(problematicScaffold, template);
      
      expect(formatted).toBeDefined();
      expect(formatted).toContain('valid subject');
      expect(formatted).toContain('valid lighting');
      expect(formatted).not.toContain('null');
      expect(formatted).not.toContain('undefined');
    });
  });
});