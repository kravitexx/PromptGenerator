import { GeneratedPrompt, ClarifyingQuestion, ScaffoldSlot } from '@/types';
import { 
  getRelevantQuestions, 
  getRandomQuestions, 
  getQuestionsForSlot,
  processQuestionAnswers 
} from '@/lib/clarifyingQuestions';
import { getEmptySlots, getFilledSlots } from '@/lib/scaffold';
import { calculatePromptQuality } from '@/lib/promptBuilder';

export interface PromptAnalysis {
  qualityScore: number;
  missingSlots: string[];
  weakSlots: string[];
  suggestedQuestions: ClarifyingQuestion[];
  improvementAreas: string[];
  recommendations: string[];
}

/**
 * Analyzes a generated prompt and identifies areas for improvement
 */
export function analyzePromptForImprovement(prompt: GeneratedPrompt): PromptAnalysis {
  const emptySlots = getEmptySlots(prompt.scaffold);
  const filledSlots = getFilledSlots(prompt.scaffold);
  const qualityAnalysis = calculatePromptQuality(prompt);
  
  // Identify weak slots (filled but with minimal content)
  const weakSlots = filledSlots.filter(slot => {
    const wordCount = slot.content.trim().split(/\s+/).length;
    return wordCount <= 2; // Consider slots with 2 or fewer words as weak
  });

  // Get relevant questions based on missing and weak slots
  const missingSlotNames = emptySlots.map(slot => slot.name);
  const weakSlotNames = weakSlots.map(slot => slot.name);
  
  let suggestedQuestions: ClarifyingQuestion[] = [];
  
  // Add questions for missing slots
  if (emptySlots.length > 0) {
    suggestedQuestions.push(...getRelevantQuestions(missingSlotNames));
  }
  
  // Add questions for weak slots
  weakSlots.forEach(slot => {
    const slotQuestions = getQuestionsForSlot(slot.key);
    suggestedQuestions.push(...slotQuestions.slice(0, 1)); // Add one question per weak slot
  });
  
  // If we have few questions, add some random ones for general improvement
  if (suggestedQuestions.length < 3) {
    const randomQuestions = getRandomQuestions(5 - suggestedQuestions.length);
    suggestedQuestions.push(...randomQuestions);
  }
  
  // Remove duplicates and limit to 5 questions max
  suggestedQuestions = Array.from(
    new Map(suggestedQuestions.map(q => [q.id, q])).values()
  ).slice(0, 5);

  // Generate improvement areas and recommendations
  const improvementAreas = identifyImprovementAreas(prompt.scaffold);
  const recommendations = generateRecommendations(prompt.scaffold, qualityAnalysis);

  return {
    qualityScore: qualityAnalysis.score,
    missingSlots: missingSlotNames,
    weakSlots: weakSlotNames,
    suggestedQuestions,
    improvementAreas,
    recommendations,
  };
}

/**
 * Identifies specific areas where the prompt could be improved
 */
function identifyImprovementAreas(scaffold: ScaffoldSlot[]): string[] {
  const areas: string[] = [];
  
  scaffold.forEach(slot => {
    if (!slot.content.trim()) {
      areas.push(`Missing ${slot.name.toLowerCase()}`);
    } else if (slot.content.trim().split(/\s+/).length <= 2) {
      areas.push(`Vague ${slot.name.toLowerCase()}`);
    }
  });

  // Check for specific content patterns
  const allContent = scaffold.map(slot => slot.content).join(' ').toLowerCase();
  
  if (!allContent.includes('quality') && !allContent.includes('detailed') && !allContent.includes('4k')) {
    areas.push('Lacks quality descriptors');
  }
  
  if (!allContent.includes('lighting') && !allContent.includes('light')) {
    areas.push('No lighting specification');
  }
  
  if (!allContent.includes('style') && !allContent.includes('art')) {
    areas.push('Unclear artistic style');
  }

  return areas;
}

/**
 * Generates specific recommendations for prompt improvement
 */
function generateRecommendations(scaffold: ScaffoldSlot[], qualityAnalysis: ReturnType<typeof calculatePromptQuality>): string[] {
  const recommendations: string[] = [];
  
  // Recommendations based on empty slots
  const emptySlots = getEmptySlots(scaffold);
  emptySlots.forEach(slot => {
    switch (slot.key) {
      case 'S':
        recommendations.push('Add a clear main subject or focus for your image');
        break;
      case 'C':
        recommendations.push('Specify the setting, environment, or background context');
        break;
      case 'St':
        recommendations.push('Define the art style, medium, or visual approach');
        break;
      case 'Co':
        recommendations.push('Include camera angle, framing, or composition details');
        break;
      case 'L':
        recommendations.push('Describe the lighting conditions and mood');
        break;
      case 'A':
        recommendations.push('Add atmospheric qualities and emotional tone');
        break;
      case 'Q':
        recommendations.push('Include quality descriptors like "high quality", "detailed", or "4K"');
        break;
    }
  });

  // Recommendations based on quality score
  if (qualityAnalysis.score < 50) {
    recommendations.push('Consider adding more specific and detailed descriptions');
    recommendations.push('Use more descriptive adjectives and technical terms');
  } else if (qualityAnalysis.score < 75) {
    recommendations.push('Add more technical quality terms for better results');
    recommendations.push('Consider specifying the artistic medium or style');
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Your prompt looks good! Consider fine-tuning specific details');
    recommendations.push('Try experimenting with different artistic styles or lighting');
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

/**
 * Applies clarifying question answers to update a prompt
 */
export function applyQuestionAnswersToPrompt(
  prompt: GeneratedPrompt,
  answers: Record<string, unknown>
): ScaffoldSlot[] {
  const scaffoldUpdates = processQuestionAnswers(answers);
  
  return prompt.scaffold.map(slot => {
    const updateKey = slot.key;
    const updateContent = scaffoldUpdates[updateKey];
    
    if (updateContent) {
      // Merge new content with existing content
      const existingContent = slot.content.trim();
      const newContent = existingContent 
        ? `${existingContent}, ${updateContent}`
        : updateContent;
      
      return {
        ...slot,
        content: newContent,
      };
    }
    
    return slot;
  });
}

/**
 * Determines if a prompt would benefit from clarifying questions
 */
export function shouldShowClarifyingQuestions(prompt: GeneratedPrompt): boolean {
  const analysis = analyzePromptForImprovement(prompt);
  
  // Show questions if:
  // - Quality score is below 75%
  // - There are missing slots
  // - There are weak slots
  return (
    analysis.qualityScore < 75 ||
    analysis.missingSlots.length > 0 ||
    analysis.weakSlots.length > 0
  );
}

/**
 * Gets a prioritized list of questions based on prompt analysis
 */
export function getPrioritizedQuestions(prompt: GeneratedPrompt): ClarifyingQuestion[] {
  const analysis = analyzePromptForImprovement(prompt);
  return analysis.suggestedQuestions;
}

/**
 * Calculates improvement potential score
 */
export function calculateImprovementPotential(prompt: GeneratedPrompt): {
  score: number;
  areas: string[];
  priority: 'low' | 'medium' | 'high';
} {
  const analysis = analyzePromptForImprovement(prompt);
  
  let score = 0;
  const areas: string[] = [];
  
  // Points for missing slots (high impact)
  score += analysis.missingSlots.length * 20;
  areas.push(...analysis.missingSlots.map(slot => `Add ${slot.toLowerCase()}`));
  
  // Points for weak slots (medium impact)
  score += analysis.weakSlots.length * 10;
  areas.push(...analysis.weakSlots.map(slot => `Enhance ${slot.toLowerCase()}`));
  
  // Points based on quality score
  if (analysis.qualityScore < 50) {
    score += 30;
    areas.push('Overall quality improvement needed');
  } else if (analysis.qualityScore < 75) {
    score += 15;
    areas.push('Minor quality enhancements possible');
  }
  
  // Determine priority
  let priority: 'low' | 'medium' | 'high' = 'low';
  if (score >= 50) {
    priority = 'high';
  } else if (score >= 25) {
    priority = 'medium';
  }
  
  return {
    score: Math.min(score, 100), // Cap at 100
    areas: areas.slice(0, 3), // Limit to top 3 areas
    priority,
  };
}