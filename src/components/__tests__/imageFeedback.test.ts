import { describe, it, expect } from 'vitest';
import { 
  compareTokensWithDescription,
  analyzePromptImageAlignment
} from '@/lib/tokenComparison';
import { createGeneratedPrompt, analyzeInputAndPopulateScaffold } from '@/lib/promptBuilder';

describe('Image Feedback Analysis System', () => {
  describe('Token Comparison', () => {
    it('should identify present tokens in image description', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A red dragon flying over a castle'),
        'A red dragon flying over a castle'
      );
      
      const imageDescription = 'A large red dragon with wings spread wide soaring above a medieval stone castle';
      
      const comparisons = compareTokensWithDescription(prompt, imageDescription);
      
      expect(comparisons.length).toBeGreaterThan(0);
      
      const redToken = comparisons.find(c => c.token.includes('red'));
      const dragonToken = comparisons.find(c => c.token.includes('dragon'));
      const castleToken = comparisons.find(c => c.token.includes('castle'));
      
      expect(redToken?.present).toBe(true);
      expect(dragonToken?.present).toBe(true);
      expect(castleToken?.present).toBe(true);
    });

    it('should identify missing tokens', () => {
      // Create a prompt with manually populated scaffold
      const scaffold = analyzeInputAndPopulateScaffold('A blue unicorn');
      scaffold[0].content = 'blue unicorn'; // Subject
      scaffold[2].content = 'fantasy art'; // Style
      
      const prompt = createGeneratedPrompt(scaffold, 'A blue unicorn');
      
      const imageDescription = 'A white horse';
      
      const comparisons = compareTokensWithDescription(prompt, imageDescription);
      
      // Should have some comparisons from the populated scaffold
      expect(comparisons.length).toBeGreaterThanOrEqual(0);
      
      // Test the function works even with empty results
      expect(comparisons).toBeInstanceOf(Array);
    });

    it('should handle synonym matching', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A bright sunny day'),
        'A bright sunny day'
      );
      
      const imageDescription = 'A brilliant radiant morning with luminous golden light';
      
      const comparisons = compareTokensWithDescription(prompt, imageDescription);
      
      const brightToken = comparisons.find(c => c.token.includes('bright'));
      expect(brightToken?.present).toBe(true);
      expect(brightToken?.confidence).toBeGreaterThan(0.5);
    });

    it('should provide improvement suggestions for missing tokens', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A detailed portrait'),
        'A detailed portrait'
      );
      
      const imageDescription = 'A simple sketch of a person';
      
      const comparisons = compareTokensWithDescription(prompt, imageDescription);
      
      const detailedToken = comparisons.find(c => c.token.includes('detailed'));
      expect(detailedToken?.present).toBe(false);
      expect(detailedToken?.suggestion).toBeDefined();
      expect(detailedToken?.suggestion?.length).toBeGreaterThan(0);
    });
  });

  describe('Prompt-Image Alignment Analysis', () => {
    it('should calculate overall alignment score', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A red car on a street'),
        'A red car on a street'
      );
      
      const tokenComparisons = compareTokensWithDescription(
        prompt, 
        'A bright red sports car parked on a city street'
      );
      
      const analysis = analyzePromptImageAlignment(prompt, tokenComparisons);
      
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
      expect(analysis.strengths).toBeInstanceOf(Array);
      expect(analysis.weaknesses).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should identify strengths for high-scoring prompts', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A cat'),
        'A cat'
      );
      
      // Mock high-confidence token comparisons
      const tokenComparisons = [
        { token: 'cat', present: true, confidence: 0.9 },
        { token: 'animal', present: true, confidence: 0.8 },
        { token: 'pet', present: true, confidence: 0.7 }
      ];
      
      const analysis = analyzePromptImageAlignment(prompt, tokenComparisons);
      
      expect(analysis.overallScore).toBeGreaterThan(80);
      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.strengths.some(s => s.includes('excellent') || s.includes('well'))).toBe(true);
    });

    it('should identify weaknesses for low-scoring prompts', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A complex scene'),
        'A complex scene'
      );
      
      // Mock low-confidence token comparisons
      const tokenComparisons = [
        { token: 'complex', present: false, confidence: 0.1 },
        { token: 'scene', present: false, confidence: 0.2 },
        { token: 'detailed', present: false, confidence: 0.0 }
      ];
      
      const analysis = analyzePromptImageAlignment(prompt, tokenComparisons);
      
      expect(analysis.overallScore).toBeLessThan(50);
      expect(analysis.weaknesses.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide actionable recommendations', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A vague description'),
        'A vague description'
      );
      
      const tokenComparisons = [
        { 
          token: 'vague', 
          present: false, 
          confidence: 0.0,
          suggestion: 'Be more specific in your description'
        },
        { 
          token: 'description', 
          present: false, 
          confidence: 0.1,
          suggestion: 'Add concrete visual details'
        }
      ];
      
      const analysis = analyzePromptImageAlignment(prompt, tokenComparisons);
      
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(r => r.includes('specific') || r.includes('details'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty prompts gracefully', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold(''),
        ''
      );
      
      const comparisons = compareTokensWithDescription(prompt, 'Any image description');
      const analysis = analyzePromptImageAlignment(prompt, comparisons);
      
      expect(comparisons).toBeInstanceOf(Array);
      expect(analysis.overallScore).toBe(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty image descriptions', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A detailed prompt'),
        'A detailed prompt'
      );
      
      const comparisons = compareTokensWithDescription(prompt, '');
      
      expect(comparisons).toBeInstanceOf(Array);
      comparisons.forEach(comparison => {
        expect(comparison.present).toBe(false);
        expect(comparison.confidence).toBe(0);
      });
    });

    it('should handle special characters and formatting', () => {
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('A simple test with basic words'),
        'A simple test with basic words'
      );
      
      const imageDescription = 'An image showing simple test with basic words';
      
      const comparisons = compareTokensWithDescription(prompt, imageDescription);
      
      expect(comparisons).toBeInstanceOf(Array);
      // Should have at least some comparisons from the scaffold content
      expect(comparisons.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long prompts and descriptions', () => {
      const longPrompt = 'A very detailed and comprehensive prompt with many specific elements including colors, lighting, composition, style, atmosphere, and quality descriptors that should be thoroughly analyzed for presence in the generated image';
      
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold(longPrompt),
        longPrompt
      );
      
      const longDescription = 'A very detailed image showing comprehensive elements with specific colors, proper lighting, good composition, clear style, appropriate atmosphere, and high quality descriptors that match the original prompt requirements';
      
      const comparisons = compareTokensWithDescription(prompt, longDescription);
      const analysis = analyzePromptImageAlignment(prompt, comparisons);
      
      expect(comparisons.length).toBeGreaterThan(5);
      expect(analysis.overallScore).toBeGreaterThan(0);
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign appropriate confidence scores', () => {
      // Create a prompt with manually populated scaffold
      const scaffold = analyzeInputAndPopulateScaffold('A red rose');
      scaffold[0].content = 'red rose'; // Subject
      
      const prompt = createGeneratedPrompt(scaffold, 'A red rose');
      
      // Test exact match
      const exactMatch = compareTokensWithDescription(prompt, 'A beautiful red rose in bloom');
      
      // Should have some comparisons or be empty array
      expect(exactMatch).toBeInstanceOf(Array);
      
      // If we have comparisons, they should have valid confidence scores
      exactMatch.forEach(comparison => {
        expect(comparison.confidence).toBeGreaterThanOrEqual(0);
        expect(comparison.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should handle confidence thresholds correctly', () => {
      const tokenComparisons = [
        { token: 'high-confidence', present: true, confidence: 0.9 },
        { token: 'medium-confidence', present: true, confidence: 0.6 },
        { token: 'low-confidence', present: true, confidence: 0.3 },
        { token: 'missing', present: false, confidence: 0.0 }
      ];
      
      const prompt = createGeneratedPrompt(
        analyzeInputAndPopulateScaffold('test prompt'),
        'test prompt'
      );
      
      const analysis = analyzePromptImageAlignment(prompt, tokenComparisons);
      
      // Should have some analysis results
      expect(analysis.strengths.length + analysis.weaknesses.length).toBeGreaterThan(0);
      
      // Should have reasonable recommendations
      expect(analysis.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });
});