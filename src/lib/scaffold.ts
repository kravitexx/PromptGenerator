import { ScaffoldSlot } from '@/types';

// Universal 7-slot prompt scaffold structure
export const SCAFFOLD_SLOTS: ScaffoldSlot[] = [
  {
    key: 'S',
    name: 'Subject',
    description: 'The main subject or focus of the image',
    content: '',
  },
  {
    key: 'C',
    name: 'Context',
    description: 'Setting, environment, or background context',
    content: '',
  },
  {
    key: 'St',
    name: 'Style',
    description: 'Art style, medium, or visual approach',
    content: '',
  },
  {
    key: 'Co',
    name: 'Composition',
    description: 'Camera angle, framing, and visual composition',
    content: '',
  },
  {
    key: 'L',
    name: 'Lighting',
    description: 'Lighting conditions and mood',
    content: '',
  },
  {
    key: 'A',
    name: 'Atmosphere',
    description: 'Mood, emotion, and atmospheric qualities',
    content: '',
  },
  {
    key: 'Q',
    name: 'Quality',
    description: 'Technical quality and rendering specifications',
    content: '',
  },
];

/**
 * Creates a new empty scaffold with default structure
 */
export function createEmptyScaffold(): ScaffoldSlot[] {
  return SCAFFOLD_SLOTS.map(slot => ({ ...slot }));
}

/**
 * Validates that a scaffold contains all required slots
 */
export function validateScaffold(scaffold: ScaffoldSlot[]): boolean {
  const requiredKeys = SCAFFOLD_SLOTS.map(slot => slot.key);
  const providedKeys = scaffold.map(slot => slot.key);
  
  return requiredKeys.every(key => providedKeys.includes(key));
}

/**
 * Gets a scaffold slot by key
 */
export function getScaffoldSlot(scaffold: ScaffoldSlot[], key: ScaffoldSlot['key']): ScaffoldSlot | undefined {
  return scaffold.find(slot => slot.key === key);
}

/**
 * Updates a specific slot in the scaffold
 */
export function updateScaffoldSlot(
  scaffold: ScaffoldSlot[], 
  key: ScaffoldSlot['key'], 
  content: string,
  weight?: number
): ScaffoldSlot[] {
  return scaffold.map(slot => 
    slot.key === key 
      ? { ...slot, content, weight }
      : slot
  );
}

/**
 * Checks if scaffold has any content
 */
export function hasScaffoldContent(scaffold: ScaffoldSlot[]): boolean {
  return scaffold.some(slot => slot.content.trim().length > 0);
}

/**
 * Gets empty slots in the scaffold
 */
export function getEmptySlots(scaffold: ScaffoldSlot[]): ScaffoldSlot[] {
  return scaffold.filter(slot => !slot.content.trim());
}

/**
 * Gets filled slots in the scaffold
 */
export function getFilledSlots(scaffold: ScaffoldSlot[]): ScaffoldSlot[] {
  return scaffold.filter(slot => slot.content.trim().length > 0);
}

/**
 * Converts scaffold to a simple object for easy access
 */
export function scaffoldToObject(scaffold: ScaffoldSlot[]): Record<string, string> {
  return scaffold.reduce((acc, slot) => {
    acc[slot.key] = slot.content;
    return acc;
  }, {} as Record<string, string>);
}