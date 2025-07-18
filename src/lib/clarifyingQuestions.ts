import { ClarifyingQuestion } from '@/types';

// Predefined clarifying questions database
export const CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  // Style questions
  {
    id: 'art-style',
    question: 'What art style would you like?',
    type: 'select',
    options: [
      'Photorealistic',
      'Digital Art',
      'Oil Painting',
      'Watercolor',
      'Sketch',
      'Anime/Manga',
      'Cartoon',
      'Abstract',
      'Impressionist',
      'Pop Art'
    ],
    category: 'style'
  },
  {
    id: 'medium',
    question: 'What medium or technique?',
    type: 'select',
    options: [
      'Photography',
      'Digital Painting',
      'Traditional Painting',
      '3D Render',
      'Pencil Drawing',
      'Ink Drawing',
      'Mixed Media',
      'Sculpture',
      'Collage'
    ],
    category: 'style'
  },
  
  // Lighting questions
  {
    id: 'lighting-type',
    question: 'What type of lighting?',
    type: 'select',
    options: [
      'Natural Light',
      'Golden Hour',
      'Blue Hour',
      'Dramatic Lighting',
      'Soft Lighting',
      'Hard Lighting',
      'Neon Lighting',
      'Candlelight',
      'Studio Lighting',
      'Backlighting'
    ],
    category: 'lighting'
  },
  {
    id: 'mood-lighting',
    question: 'What mood should the lighting create?',
    type: 'select',
    options: [
      'Warm and Cozy',
      'Cool and Calm',
      'Mysterious',
      'Energetic',
      'Romantic',
      'Dramatic',
      'Peaceful',
      'Intense',
      'Dreamy',
      'Professional'
    ],
    category: 'lighting'
  },
  
  // Composition questions
  {
    id: 'camera-angle',
    question: 'What camera angle or viewpoint?',
    type: 'select',
    options: [
      'Eye Level',
      'Low Angle',
      'High Angle',
      'Bird\'s Eye View',
      'Worm\'s Eye View',
      'Dutch Angle',
      'Over the Shoulder',
      'Point of View',
      'Aerial View'
    ],
    category: 'composition'
  },
  {
    id: 'shot-type',
    question: 'What type of shot or framing?',
    type: 'select',
    options: [
      'Close-up',
      'Medium Shot',
      'Wide Shot',
      'Extreme Close-up',
      'Full Body',
      'Portrait',
      'Landscape',
      'Macro',
      'Panoramic'
    ],
    category: 'composition'
  },
  {
    id: 'depth-of-field',
    question: 'How should the focus be handled?',
    type: 'select',
    options: [
      'Sharp Focus Throughout',
      'Shallow Depth of Field',
      'Bokeh Background',
      'Selective Focus',
      'Deep Focus',
      'Tilt-Shift Effect'
    ],
    category: 'composition'
  },
  
  // Technical questions
  {
    id: 'image-quality',
    question: 'What quality level do you want?',
    type: 'multiselect',
    options: [
      'High Resolution',
      '4K',
      '8K',
      'Ultra Detailed',
      'Sharp',
      'Professional Quality',
      'Award Winning',
      'Masterpiece',
      'Trending on ArtStation'
    ],
    category: 'technical'
  },
  {
    id: 'color-palette',
    question: 'Any specific color preferences?',
    type: 'select',
    options: [
      'Vibrant Colors',
      'Muted Colors',
      'Monochrome',
      'Warm Tones',
      'Cool Tones',
      'Pastel Colors',
      'High Contrast',
      'Low Contrast',
      'Complementary Colors',
      'Analogous Colors'
    ],
    category: 'technical'
  },
  {
    id: 'negative-keywords',
    question: 'What should be avoided in the image?',
    type: 'text',
    category: 'technical'
  },
  
  // Context and atmosphere
  {
    id: 'time-of-day',
    question: 'What time of day?',
    type: 'select',
    options: [
      'Dawn',
      'Morning',
      'Midday',
      'Afternoon',
      'Sunset',
      'Dusk',
      'Night',
      'Midnight'
    ],
    category: 'lighting'
  },
  {
    id: 'weather',
    question: 'What weather conditions?',
    type: 'select',
    options: [
      'Clear Sky',
      'Cloudy',
      'Stormy',
      'Rainy',
      'Snowy',
      'Foggy',
      'Misty',
      'Windy',
      'Sunny',
      'Overcast'
    ],
    category: 'composition'
  },
  {
    id: 'emotion',
    question: 'What emotion should the image convey?',
    type: 'select',
    options: [
      'Joy',
      'Sadness',
      'Excitement',
      'Calm',
      'Mystery',
      'Wonder',
      'Power',
      'Elegance',
      'Chaos',
      'Harmony'
    ],
    category: 'style'
  }
];

/**
 * Gets questions by category
 */
export function getQuestionsByCategory(category: ClarifyingQuestion['category']): ClarifyingQuestion[] {
  return CLARIFYING_QUESTIONS.filter(q => q.category === category);
}

/**
 * Gets a random selection of questions for prompt improvement
 */
export function getRandomQuestions(count: number = 3): ClarifyingQuestion[] {
  const shuffled = [...CLARIFYING_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Gets questions relevant to missing scaffold slots
 */
export function getRelevantQuestions(missingSlots: string[]): ClarifyingQuestion[] {
  const relevantQuestions: ClarifyingQuestion[] = [];
  
  if (missingSlots.includes('Style')) {
    relevantQuestions.push(...getQuestionsByCategory('style').slice(0, 2));
  }
  
  if (missingSlots.includes('Lighting')) {
    relevantQuestions.push(...getQuestionsByCategory('lighting').slice(0, 2));
  }
  
  if (missingSlots.includes('Composition')) {
    relevantQuestions.push(...getQuestionsByCategory('composition').slice(0, 2));
  }
  
  if (missingSlots.includes('Quality')) {
    relevantQuestions.push(...getQuestionsByCategory('technical').slice(0, 1));
  }
  
  return relevantQuestions;
}

/**
 * Processes answers from clarifying questions and suggests scaffold updates
 */
export function processQuestionAnswers(
  answers: Record<string, any>
): Record<string, string> {
  const scaffoldUpdates: Record<string, string> = {};
  
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = CLARIFYING_QUESTIONS.find(q => q.id === questionId);
    if (!question || !answer) return;
    
    const answerText = Array.isArray(answer) ? answer.join(', ') : String(answer);
    
    // Map question categories to scaffold slots
    switch (question.category) {
      case 'style':
        scaffoldUpdates.St = scaffoldUpdates.St 
          ? `${scaffoldUpdates.St}, ${answerText}`
          : answerText;
        break;
      case 'lighting':
        scaffoldUpdates.L = scaffoldUpdates.L 
          ? `${scaffoldUpdates.L}, ${answerText}`
          : answerText;
        break;
      case 'composition':
        scaffoldUpdates.Co = scaffoldUpdates.Co 
          ? `${scaffoldUpdates.Co}, ${answerText}`
          : answerText;
        break;
      case 'technical':
        if (questionId === 'negative-keywords') {
          // Handle negative keywords separately
          scaffoldUpdates._negative = answerText;
        } else {
          scaffoldUpdates.Q = scaffoldUpdates.Q 
            ? `${scaffoldUpdates.Q}, ${answerText}`
            : answerText;
        }
        break;
    }
  });
  
  return scaffoldUpdates;
}

/**
 * Gets questions that would help improve a specific scaffold slot
 */
export function getQuestionsForSlot(slotKey: string): ClarifyingQuestion[] {
  const categoryMap: Record<string, ClarifyingQuestion['category']> = {
    'S': 'style', // Subject can benefit from style questions
    'C': 'composition', // Context relates to composition
    'St': 'style',
    'Co': 'composition',
    'L': 'lighting',
    'A': 'style', // Atmosphere relates to style/mood
    'Q': 'technical',
  };
  
  const category = categoryMap[slotKey];
  return category ? getQuestionsByCategory(category) : [];
}