import { describe, it, expect } from 'vitest';
import { 
  analyzeInputAndPopulateScaffold, 
  createGeneratedPrompt,
  calculatePromptQuality 
} from '@/lib/promptBuilder';
import { formatPromptForModel, getAllTemplates } from '@/lib/modelTemplates';
import { scaffoldToObject } from '@/lib/scaffold';

describe('Prompt Generation and Formatting', () => {
  it('should analyze input and populate scaffold', () => {
    const userInput = 'A realistic portrait of a woman in a forest with golden hour lighting';
    const scaffold = analyzeInputAndPopulateScaffold(userInput);
    
    expect(scaffold).toHaveLength(7);
    expect(scaffold.some(slot => slot.content.includes('woman'))).toBe(true);
    expect(scaffold.some(slot => slot.content.includes('forest'))).toBe(true);
    expect(scaffold.some(slot => slot.content.includes('golden hour'))).toBe(true);
  });

  it('should create a generated prompt with all model formats', () => {
    const userInput = 'A cat sitting on a windowsill';
    const scaffold = analyzeInputAndPopulateScaffold(userInput);
    const prompt = createGeneratedPrompt(scaffold, userInput);
    
    expect(prompt.id).toBeDefined();
    expect(prompt.scaffold).toHaveLength(7);
    expect(prompt.rawText).toBe(userInput);
    expect(Object.keys(prompt.formattedOutputs)).toHaveLength(5); // All 5 model templates
    expect(prompt.metadata.createdAt).toBeInstanceOf(Date);
  });

  it('should format prompts correctly for different models', () => {
    const scaffold = analyzeInputAndPopulateScaffold('A dog in a park');
    const scaffoldObject = scaffoldToObject(scaffold);
    const templates = getAllTemplates();
    
    templates.forEach(template => {
      const formatted = formatPromptForModel(scaffoldObject, template);
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
      
      // Check that template-specific formatting is applied with negative prompt
      const formattedWithNegative = formatPromptForModel(scaffoldObject, template, 'blurry');
      
      if (template.id === 'midjourney-v6') {
        expect(formattedWithNegative).toContain('--v 6');
        expect(formattedWithNegative).toContain('--no blurry');
      }
      if (template.id === 'flux-v9') {
        expect(formatted).toContain('|');
        expect(formattedWithNegative).toContain('avoid="blurry"');
      }
    });
  });

  it('should calculate prompt quality correctly', () => {
    const userInput = 'A detailed portrait';
    const scaffold = analyzeInputAndPopulateScaffold(userInput);
    const prompt = createGeneratedPrompt(scaffold, userInput);
    
    const quality = calculatePromptQuality(prompt);
    
    expect(quality.score).toBeGreaterThanOrEqual(0);
    expect(quality.score).toBeLessThanOrEqual(100);
    expect(quality.breakdown).toBeDefined();
    expect(quality.recommendations).toBeInstanceOf(Array);
  });

  it('should handle empty input gracefully', () => {
    const scaffold = analyzeInputAndPopulateScaffold('');
    const prompt = createGeneratedPrompt(scaffold, '');
    
    expect(prompt.scaffold).toHaveLength(7);
    expect(prompt.rawText).toBe('');
    
    const quality = calculatePromptQuality(prompt);
    expect(quality.score).toBe(0); // Should be 0 for empty prompt
    expect(quality.recommendations.length).toBeGreaterThan(0);
  });

  it('should merge existing scaffold content with new input', () => {
    const initialInput = 'A cat';
    const initialScaffold = analyzeInputAndPopulateScaffold(initialInput);
    
    const additionalInput = 'sitting in golden hour lighting';
    const updatedScaffold = analyzeInputAndPopulateScaffold(additionalInput, initialScaffold);
    
    // Should preserve existing content and add new content
    const subjectSlot = updatedScaffold.find(slot => slot.key === 'S');
    const lightingSlot = updatedScaffold.find(slot => slot.key === 'L');
    
    expect(subjectSlot?.content).toContain('cat');
    expect(lightingSlot?.content).toContain('golden hour');
  });
});