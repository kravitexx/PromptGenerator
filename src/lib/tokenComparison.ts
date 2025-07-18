import { TokenComparison, GeneratedPrompt } from '@/types';
import { scaffoldToObject } from '@/lib/scaffold';

/**
 * Compares prompt tokens with image description to identify matches and mismatches
 */
export function compareTokensWithDescription(
  prompt: GeneratedPrompt,
  imageDescription: string
): TokenComparison[] {
  const description = imageDescription.toLowerCase();
  const comparisons: TokenComparison[] = [];

  // Analyze each scaffold slot
  prompt.scaffold.forEach(slot => {
    if (!slot.content.trim()) return; // Skip empty slots

    const tokenContent = slot.content.toLowerCase();
    const tokens = extractTokensFromContent(tokenContent);
    
    tokens.forEach(token => {
      const comparison = analyzeTokenPresence(token, description, slot.name);
      comparisons.push(comparison);
    });
  });

  return comparisons;
}

/**
 * Extracts individual tokens from scaffold content
 */
function extractTokensFromContent(content: string): string[] {
  // Split by common delimiters and clean up
  const tokens = content
    .split(/[,;|&+\s]/) // Added space as delimiter
    .map(token => token.trim())
    .filter(token => token.length > 2) // Minimum length of 3
    .filter(token => !isStopWord(token));
  
  // If no tokens found, return the original content as a single token
  return tokens.length > 0 ? tokens : [content.trim()].filter(t => t.length > 0);
}

/**
 * Checks if a word is a stop word that shouldn't be analyzed
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'very', 'really', 'quite', 'rather'
  ];
  return stopWords.includes(word.toLowerCase());
}

/**
 * Analyzes whether a token is present in the image description
 */
function analyzeTokenPresence(
  token: string, 
  description: string, 
  category: string
): TokenComparison {
  const tokenLower = token.toLowerCase();
  
  // Direct match
  if (description.includes(tokenLower)) {
    return {
      token,
      present: true,
      confidence: 0.9,
      suggestion: undefined
    };
  }

  // Synonym/related word matching
  const synonymMatch = findSynonymMatch(tokenLower, description);
  if (synonymMatch.found) {
    return {
      token,
      present: true,
      confidence: synonymMatch.confidence,
      suggestion: `Found as "${synonymMatch.match}"`
    };
  }

  // Partial/fuzzy matching
  const partialMatch = findPartialMatch(tokenLower, description);
  if (partialMatch.found) {
    return {
      token,
      present: true,
      confidence: partialMatch.confidence,
      suggestion: `Partially matched: "${partialMatch.match}"`
    };
  }

  // Not found - generate suggestion
  const suggestion = generateImprovementSuggestion(token, category);
  
  return {
    token,
    present: false,
    confidence: 0,
    suggestion
  };
}

/**
 * Finds synonym matches for a token in the description
 */
function findSynonymMatch(token: string, description: string): {
  found: boolean;
  confidence: number;
  match?: string;
} {
  const synonymGroups: Record<string, string[]> = {
    // Colors
    'red': ['crimson', 'scarlet', 'ruby', 'cherry', 'burgundy'],
    'blue': ['azure', 'navy', 'cobalt', 'sapphire', 'cerulean'],
    'green': ['emerald', 'jade', 'olive', 'forest', 'lime'],
    'yellow': ['golden', 'amber', 'lemon', 'canary', 'blonde'],
    'purple': ['violet', 'lavender', 'plum', 'magenta', 'indigo'],
    'orange': ['amber', 'peach', 'coral', 'tangerine', 'rust'],
    'black': ['dark', 'ebony', 'charcoal', 'midnight', 'shadow'],
    'white': ['pale', 'ivory', 'cream', 'snow', 'pearl'],
    
    // Lighting
    'bright': ['brilliant', 'radiant', 'luminous', 'glowing', 'vivid'],
    'dark': ['dim', 'shadowy', 'gloomy', 'murky', 'obscure'],
    'golden': ['warm', 'amber', 'honey', 'sunset', 'glowing'],
    'dramatic': ['striking', 'intense', 'bold', 'powerful', 'strong'],
    
    // Styles
    'realistic': ['photorealistic', 'lifelike', 'natural', 'authentic'],
    'artistic': ['stylized', 'creative', 'expressive', 'aesthetic'],
    'detailed': ['intricate', 'elaborate', 'complex', 'fine', 'precise'],
    
    // Composition
    'close': ['near', 'intimate', 'tight', 'focused'],
    'wide': ['broad', 'expansive', 'panoramic', 'vast'],
    'centered': ['middle', 'central', 'balanced', 'symmetrical']
  };

  // Check if token has synonyms
  const synonyms = synonymGroups[token] || [];
  
  for (const synonym of synonyms) {
    if (description.includes(synonym)) {
      return {
        found: true,
        confidence: 0.7,
        match: synonym
      };
    }
  }

  // Check reverse - if description word has token as synonym
  for (const [key, values] of Object.entries(synonymGroups)) {
    if (values.includes(token) && description.includes(key)) {
      return {
        found: true,
        confidence: 0.7,
        match: key
      };
    }
  }

  return { found: false, confidence: 0 };
}

/**
 * Finds partial/fuzzy matches for a token
 */
function findPartialMatch(token: string, description: string): {
  found: boolean;
  confidence: number;
  match?: string;
} {
  const words = description.split(/\s+/);
  
  // Look for words that contain the token or vice versa
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    
    // Token is substring of word
    if (cleanWord.includes(token) && cleanWord !== token) {
      return {
        found: true,
        confidence: 0.5,
        match: word
      };
    }
    
    // Word is substring of token (less likely but possible)
    if (token.includes(cleanWord) && cleanWord.length > 3) {
      return {
        found: true,
        confidence: 0.4,
        match: word
      };
    }
    
    // Levenshtein distance for similar words
    if (calculateSimilarity(token, cleanWord) > 0.7 && cleanWord.length > 3) {
      return {
        found: true,
        confidence: 0.6,
        match: word
      };
    }
  }

  return { found: false, confidence: 0 };
}

/**
 * Calculates string similarity using a simple algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Generates improvement suggestions for missing tokens
 */
function generateImprovementSuggestion(token: string, category: string): string {
  const suggestions: Record<string, string[]> = {
    'Subject': [
      `Make "${token}" more prominent in the image`,
      `Ensure "${token}" is clearly visible and well-defined`,
      `Consider adding more descriptive details about "${token}"`
    ],
    'Context': [
      `Add more environmental details about "${token}"`,
      `Make the "${token}" setting more obvious`,
      `Include visual cues that clearly show "${token}"`
    ],
    'Style': [
      `Emphasize the "${token}" artistic style more strongly`,
      `Use stronger style keywords to achieve "${token}" look`,
      `Consider combining "${token}" with related style terms`
    ],
    'Composition': [
      `Adjust framing to better show "${token}" perspective`,
      `Use composition techniques that emphasize "${token}"`,
      `Consider camera angle adjustments for "${token}"`
    ],
    'Lighting': [
      `Enhance lighting to achieve "${token}" effect`,
      `Use stronger lighting keywords for "${token}"`,
      `Consider time-of-day or lighting setup for "${token}"`
    ],
    'Atmosphere': [
      `Strengthen mood keywords to convey "${token}"`,
      `Add atmospheric elements that support "${token}"`,
      `Use emotional descriptors that reinforce "${token}"`
    ],
    'Quality': [
      `Add technical quality terms alongside "${token}"`,
      `Use more specific quality descriptors than "${token}"`,
      `Consider platform-specific quality keywords`
    ]
  };

  const categoryOptions = suggestions[category] || suggestions['Subject'];
  return categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
}

/**
 * Analyzes overall prompt-image alignment and provides recommendations
 */
export function analyzePromptImageAlignment(
  prompt: GeneratedPrompt,
  tokenComparisons: TokenComparison[]
): {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const totalTokens = tokenComparisons.length;
  const presentTokens = tokenComparisons.filter(t => t.present).length;
  const highConfidenceTokens = tokenComparisons.filter(t => t.confidence > 0.7).length;
  
  const overallScore = totalTokens > 0 ? Math.round((presentTokens / totalTokens) * 100) : 0;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze by scaffold category
  const categoryAnalysis = analyzeCategoryPerformance(prompt, tokenComparisons);
  
  // Generate strengths
  if (overallScore >= 80) {
    strengths.push('Excellent overall prompt execution');
  } else if (overallScore >= 60) {
    strengths.push('Good prompt-to-image alignment');
  }
  
  if (highConfidenceTokens / totalTokens > 0.6) {
    strengths.push('Most elements are clearly represented');
  }

  // Generate weaknesses and recommendations
  if (overallScore < 60) {
    weaknesses.push('Significant gaps between prompt and generated image');
    recommendations.push('Consider simplifying your prompt or using more specific descriptors');
  }

  Object.entries(categoryAnalysis).forEach(([category, analysis]) => {
    if (analysis.score < 50) {
      weaknesses.push(`${category} elements are poorly represented`);
      recommendations.push(`Strengthen ${category.toLowerCase()} keywords in your prompt`);
    } else if (analysis.score > 80) {
      strengths.push(`${category} elements are well executed`);
    }
  });

  // Add specific recommendations based on missing high-impact tokens
  const missingImportantTokens = tokenComparisons
    .filter(t => !t.present)
    .slice(0, 3); // Top 3 missing tokens

  missingImportantTokens.forEach(token => {
    if (token.suggestion) {
      recommendations.push(token.suggestion);
    }
  });

  return {
    overallScore,
    strengths: strengths.slice(0, 5), // Limit to 5 strengths
    weaknesses: weaknesses.slice(0, 5), // Limit to 5 weaknesses
    recommendations: recommendations.slice(0, 5) // Limit to 5 recommendations
  };
}

/**
 * Analyzes performance by scaffold category
 */
function analyzeCategoryPerformance(
  prompt: GeneratedPrompt,
  tokenComparisons: TokenComparison[]
): Record<string, { score: number; tokens: TokenComparison[] }> {
  const categoryMap: Record<string, string> = {
    'S': 'Subject',
    'C': 'Context', 
    'St': 'Style',
    'Co': 'Composition',
    'L': 'Lighting',
    'A': 'Atmosphere',
    'Q': 'Quality'
  };

  const analysis: Record<string, { score: number; tokens: TokenComparison[] }> = {};

  // Group tokens by category (this is simplified - in reality we'd need better mapping)
  Object.entries(categoryMap).forEach(([key, category]) => {
    const slot = prompt.scaffold.find(s => s.key === key);
    if (!slot || !slot.content.trim()) {
      analysis[category] = { score: 0, tokens: [] };
      return;
    }

    // Find tokens that likely belong to this category
    const categoryTokens = tokenComparisons.filter(token => 
      slot.content.toLowerCase().includes(token.token.toLowerCase())
    );

    const presentTokens = categoryTokens.filter(t => t.present).length;
    const score = categoryTokens.length > 0 ? 
      Math.round((presentTokens / categoryTokens.length) * 100) : 0;

    analysis[category] = { score, tokens: categoryTokens };
  });

  return analysis;
}