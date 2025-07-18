import { GeneratedPrompt, ScaffoldSlot, ModelTemplate } from '@/types';
import { createEmptyScaffold, scaffoldToObject, validateScaffold } from './scaffold';
import { formatPromptForModel, getAllTemplates } from './modelTemplates';
import { v4 as uuidv4 } from 'uuid';

/**
 * Analyzes user input and populates scaffold slots intelligently
 */
export function analyzeInputAndPopulateScaffold(
  userInput: string,
  existingScaffold?: ScaffoldSlot[]
): ScaffoldSlot[] {
  const scaffold = existingScaffold || createEmptyScaffold();
  
  // Simple keyword-based analysis for initial population
  // This would be enhanced with AI analysis in a real implementation
  const analysis = analyzeTextForScaffoldElements(userInput);
  
  // Update scaffold with analyzed content
  return scaffold.map(slot => {
    const existingContent = slot.content;
    const newContent = analysis[slot.key] || '';
    
    // Merge existing and new content intelligently
    const mergedContent = mergeSlotContent(existingContent, newContent);
    
    return {
      ...slot,
      content: mergedContent,
    };
  });
}

/**
 * Simple text analysis to extract scaffold elements
 * In production, this would use AI/NLP for better analysis
 */
function analyzeTextForScaffoldElements(text: string): Record<string, string> {
  const analysis: Record<string, string> = {};
  const lowerText = text.toLowerCase();
  
  // Subject detection (nouns, people, objects)
  const subjectKeywords = ['person', 'man', 'woman', 'child', 'cat', 'dog', 'car', 'house', 'tree'];
  const foundSubjects = subjectKeywords.filter(keyword => lowerText.includes(keyword));
  if (foundSubjects.length > 0) {
    analysis.S = foundSubjects.join(', ');
  }
  
  // Context detection (locations, settings)
  const contextKeywords = ['in', 'at', 'on', 'inside', 'outside', 'forest', 'city', 'beach', 'mountain'];
  const contextMatches = contextKeywords.filter(keyword => lowerText.includes(keyword));
  if (contextMatches.length > 0) {
    analysis.C = extractContextFromText(text, contextMatches);
  }
  
  // Style detection
  const styleKeywords = ['realistic', 'cartoon', 'anime', 'painting', 'sketch', 'digital art', 'oil painting'];
  const foundStyles = styleKeywords.filter(keyword => lowerText.includes(keyword));
  if (foundStyles.length > 0) {
    analysis.St = foundStyles.join(', ');
  }
  
  // Lighting detection
  const lightingKeywords = ['bright', 'dark', 'sunset', 'sunrise', 'golden hour', 'dramatic lighting'];
  const foundLighting = lightingKeywords.filter(keyword => lowerText.includes(keyword));
  if (foundLighting.length > 0) {
    analysis.L = foundLighting.join(', ');
  }
  
  // Quality detection
  const qualityKeywords = ['high quality', '4k', '8k', 'detailed', 'sharp', 'professional'];
  const foundQuality = qualityKeywords.filter(keyword => lowerText.includes(keyword));
  if (foundQuality.length > 0) {
    analysis.Q = foundQuality.join(', ');
  }
  
  return analysis;
}

/**
 * Extracts context information from text
 */
function extractContextFromText(text: string, contextKeywords: string[]): string {
  // Simple extraction - in production would use more sophisticated NLP
  const sentences = text.split(/[.!?]+/);
  const contextSentences = sentences.filter(sentence => 
    contextKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  
  return contextSentences.join('. ').trim();
}

/**
 * Merges existing slot content with new content intelligently
 */
function mergeSlotContent(existing: string, newContent: string): string {
  if (!existing) return newContent;
  if (!newContent) return existing;
  
  // Avoid duplicates
  const existingWords = existing.toLowerCase().split(/[,\s]+/);
  const newWords = newContent.toLowerCase().split(/[,\s]+/);
  const uniqueNewWords = newWords.filter(word => !existingWords.includes(word));
  
  if (uniqueNewWords.length === 0) return existing;
  
  return `${existing}, ${uniqueNewWords.join(' ')}`;
}

/**
 * Creates a GeneratedPrompt from a populated scaffold
 */
export function createGeneratedPrompt(
  scaffold: ScaffoldSlot[],
  rawText: string,
  modelId: string = 'stable-diffusion-3.5'
): GeneratedPrompt {
  if (!validateScaffold(scaffold)) {
    throw new Error('Invalid scaffold: missing required slots');
  }
  
  const scaffoldObject = scaffoldToObject(scaffold);
  const templates = getAllTemplates();
  
  // Generate formatted outputs for all templates
  const formattedOutputs: Record<string, string> = {};
  templates.forEach(template => {
    formattedOutputs[template.id] = formatPromptForModel(scaffoldObject, template);
  });
  
  return {
    id: uuidv4(),
    scaffold: [...scaffold], // Create a copy
    rawText,
    formattedOutputs,
    metadata: {
      createdAt: new Date(),
      model: modelId,
      version: 1,
    },
  };
}

/**
 * Updates a generated prompt with new scaffold content
 */
export function updateGeneratedPrompt(
  prompt: GeneratedPrompt,
  newScaffold: ScaffoldSlot[]
): GeneratedPrompt {
  const scaffoldObject = scaffoldToObject(newScaffold);
  const templates = getAllTemplates();
  
  // Regenerate formatted outputs
  const formattedOutputs: Record<string, string> = {};
  templates.forEach(template => {
    formattedOutputs[template.id] = formatPromptForModel(scaffoldObject, template);
  });
  
  return {
    ...prompt,
    scaffold: [...newScaffold],
    formattedOutputs,
    metadata: {
      ...prompt.metadata,
      version: prompt.metadata.version + 1,
    },
  };
}

/**
 * Gets the formatted prompt for a specific model
 */
export function getFormattedPrompt(
  prompt: GeneratedPrompt,
  modelId: string,
  negativePrompt?: string
): string {
  const scaffoldObject = scaffoldToObject(prompt.scaffold);
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === modelId);
  
  if (!template) {
    throw new Error(`Unknown model template: ${modelId}`);
  }
  
  return formatPromptForModel(scaffoldObject, template, negativePrompt);
}

/**
 * Validates that a prompt has sufficient content
 */
export function validatePromptContent(prompt: GeneratedPrompt): {
  isValid: boolean;
  missingSlots: string[];
  suggestions: string[];
} {
  const missingSlots: string[] = [];
  const suggestions: string[] = [];
  
  prompt.scaffold.forEach(slot => {
    if (!slot.content.trim()) {
      missingSlots.push(slot.name);
    }
  });
  
  // Generate suggestions based on missing content
  if (missingSlots.includes('Subject')) {
    suggestions.push('Add a clear subject or main focus for your image');
  }
  if (missingSlots.includes('Style')) {
    suggestions.push('Consider specifying an art style (e.g., realistic, cartoon, painting)');
  }
  if (missingSlots.includes('Quality')) {
    suggestions.push('Add quality descriptors like "high quality", "detailed", or "4K"');
  }
  
  return {
    isValid: missingSlots.length === 0,
    missingSlots,
    suggestions,
  };
}

/**
 * Estimates the quality score of a prompt based on completeness and content
 */
export function calculatePromptQuality(prompt: GeneratedPrompt): {
  score: number; // 0-100
  breakdown: Record<string, number>;
  recommendations: string[];
} {
  const breakdown: Record<string, number> = {};
  const recommendations: string[] = [];
  
  // Score each slot
  prompt.scaffold.forEach(slot => {
    let slotScore = 0;
    
    if (slot.content.trim()) {
      slotScore = 50; // Base score for having content
      
      // Bonus for detailed content
      const wordCount = slot.content.split(/\s+/).length;
      if (wordCount > 2) slotScore += 20;
      if (wordCount > 5) slotScore += 20;
      
      // Bonus for specific keywords
      if (slot.key === 'Q' && /\b(4k|8k|high quality|detailed|professional)\b/i.test(slot.content)) {
        slotScore += 10;
      }
    } else {
      recommendations.push(`Add content to ${slot.name} slot`);
    }
    
    breakdown[slot.name] = Math.min(slotScore, 100);
  });
  
  // Calculate overall score
  const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / prompt.scaffold.length;
  
  return {
    score: Math.round(averageScore),
    breakdown,
    recommendations,
  };
}