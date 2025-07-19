import { describe, it, expect } from 'vitest';
import { 
  analyzeInputAndPopulateScaffold, 
  createGeneratedPrompt, 
  validatePromptContent,
  calculatePromptQuality 
} from '@/lib/promptBuilder';
import { ScaffoldSlot, GeneratedPrompt } from '@/types';

describe('Prompt Builder', () => {
  const mockScaffold: ScaffoldSlot[] = [
    { key: 'S', name: 'Subject', content: 'sunset', required: true },
    { key: 'C', name: 'Context', content: 'over mountains', required: false },
    { key: 'St', name: 'Style', content: 'photorealistic', required: true },
    { key: 'Co', name: 'Colors', content: 'warm orange', required: false },
    { key: 'L', name: 'Lighting', content: 'golden hour', required: false },
    { key: 'A', name: 'Atmosphere', content: 'peaceful', required: false },
    { key: 'Q', name: 'Quality', content: 'high quality, detailed', required: false },
  ];

  describe('analyzeInputAndPopulateScaffold', () => {
    it('should populate scaffold from user input', () => {
      const userInput = 'A beautiful sunset over mountains with warm colors';
      const result = analyzeInputAndPopulateScaffold(userInput);
      
      expect(result).toHaveLength(7);
      expect(result.find(slot => slot.key === 'S')?.content).toBeTruthy();
    });

    it('should handle empty input', () => {
      const result = analyzeInputAndPopulateScaffold('');
      
      expect(result).toHaveLength(7);
      result.forEach(slot => {
        expect(slot.content).toBe('');
      });
    });

    it('should extract style keywords', () => {
      const userInput = 'photorealistic portrait of a person';
      const result = analyzeInputAndPopulateScaffold(userInput);
      
      const styleSlot = result.find(slot => slot.key === 'St');
      expect(styleSlot?.content).toContain('realistic');
    });
  });

  describe('createGeneratedPrompt', () => {
    it('should create a generated prompt from scaffold', () => {
      const result = createGeneratedPrompt(mockScaffold, 'A beautiful sunset over mountains');
      
      expect(result.id).toBeTruthy();
      expect(result.rawText).toBe('A beautiful sunset over mountains');
      expect(result.scaffold).toHaveLength(7);
      expect(result.formattedOutputs).toBeTruthy();
      expect(result.metadata.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid scaffold', () => {
      const invalidScaffold = mockScaffold.map(slot => 
        slot.key === 'S' ? { ...slot, content: '' } : slot
      );
      
      expect(() => createGeneratedPrompt(invalidScaffold, 'test')).toThrow();
    });
  });

  describe('validatePromptContent', () => {
    it('should validate complete prompt', () => {
      const prompt = createGeneratedPrompt(mockScaffold, 'test');
      const result = validatePromptContent(prompt);
      
      expect(result.isValid).toBe(true);
      expect(result.missingSlots).toHaveLength(0);
    });

    it('should detect missing content', () => {
      const incompleteScaffold = mockScaffold.map(slot => 
        slot.key === 'S' ? { ...slot, content: '' } : slot
      );
      const prompt: GeneratedPrompt = {
        id: 'test',
        scaffold: incompleteScaffold,
        rawText: 'test',
        formattedOutputs: {},
        metadata: { createdAt: new Date(), model: 'test', version: 1 }
      };
      
      const result = validatePromptContent(prompt);
      
      expect(result.isValid).toBe(false);
      expect(result.missingSlots).toContain('Subject');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('calculatePromptQuality', () => {
    it('should calculate quality score', () => {
      const prompt = createGeneratedPrompt(mockScaffold, 'test');
      const result = calculatePromptQuality(prompt);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeTruthy();
      expect(typeof result.recommendations).toBe('object');
    });

    it('should provide recommendations for empty slots', () => {
      const emptyScaffold = mockScaffold.map(slot => ({ ...slot, content: '' }));
      const prompt: GeneratedPrompt = {
        id: 'test',
        scaffold: emptyScaffold,
        rawText: 'test',
        formattedOutputs: {},
        metadata: { createdAt: new Date(), model: 'test', version: 1 }
      };
      
      const result = calculatePromptQuality(prompt);
      
      expect(result.score).toBe(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});