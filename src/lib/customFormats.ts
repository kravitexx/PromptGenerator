import { CustomFormat } from '@/types';
import { SCAFFOLD_SLOTS } from '@/lib/scaffold';

// Storage key for custom formats
const CUSTOM_FORMATS_KEY = 'prompt_generator_custom_formats';

/**
 * Gets all stored custom formats
 */
export function getStoredCustomFormats(): CustomFormat[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CUSTOM_FORMATS_KEY);
    if (!stored) return [];
    
    const formats = JSON.parse(stored);
    return Array.isArray(formats) ? formats : [];
  } catch (error) {
    console.error('Failed to load custom formats:', error);
    return [];
  }
}

/**
 * Saves a custom format to storage
 */
export function saveCustomFormat(format: CustomFormat): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existingFormats = getStoredCustomFormats();
    const existingIndex = existingFormats.findIndex(f => f.id === format.id);
    
    if (existingIndex >= 0) {
      // Update existing format
      existingFormats[existingIndex] = format;
    } else {
      // Add new format
      existingFormats.push(format);
    }
    
    localStorage.setItem(CUSTOM_FORMATS_KEY, JSON.stringify(existingFormats));
  } catch (error) {
    console.error('Failed to save custom format:', error);
    throw new Error('Failed to save custom format');
  }
}

/**
 * Deletes a custom format from storage
 */
export function deleteCustomFormat(formatId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existingFormats = getStoredCustomFormats();
    const filteredFormats = existingFormats.filter(f => f.id !== formatId);
    
    localStorage.setItem(CUSTOM_FORMATS_KEY, JSON.stringify(filteredFormats));
  } catch (error) {
    console.error('Failed to delete custom format:', error);
    throw new Error('Failed to delete custom format');
  }
}

/**
 * Gets a specific custom format by ID
 */
export function getCustomFormat(formatId: string): CustomFormat | undefined {
  const formats = getStoredCustomFormats();
  return formats.find(f => f.id === formatId);
}

/**
 * Validates a custom format template
 */
export function validateCustomFormat(template: string): {
  isValid: boolean;
  errors: string[];
  missingTokens: string[];
  invalidTokens: string[];
} {
  const errors: string[] = [];
  const requiredTokens = SCAFFOLD_SLOTS.map(slot => `{${slot.key}}`);
  
  // Check for missing required tokens
  const missingTokens = requiredTokens.filter(token => !template.includes(token));
  if (missingTokens.length > 0) {
    errors.push(`Missing required tokens: ${missingTokens.join(', ')}`);
  }
  
  // Check for invalid tokens - only match single letter tokens
  const tokenPattern = /\{([A-Za-z]+)\}/g;
  const foundTokens = [...template.matchAll(tokenPattern)].map(match => match[0]);
  const invalidTokens = foundTokens.filter(token => !requiredTokens.includes(token));
  
  if (invalidTokens.length > 0) {
    errors.push(`Invalid tokens found: ${invalidTokens.join(', ')}`);
  }
  
  // Check for empty template
  if (!template.trim()) {
    errors.push('Template cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    missingTokens,
    invalidTokens
  };
}

/**
 * Formats a prompt using a custom format template
 */
export function formatPromptWithCustomFormat(
  scaffoldData: Record<string, string>,
  customFormat: CustomFormat
): string {
  let formatted = customFormat.template;
  
  // Replace scaffold tokens
  SCAFFOLD_SLOTS.forEach(slot => {
    const token = `{${slot.key}}`;
    const value = scaffoldData[slot.key] || '';
    formatted = formatted.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  // Clean up formatting artifacts more thoroughly
  formatted = formatted
    // Remove empty segments between commas
    .split(',')
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0)
    .join(', ')
    // Final cleanup
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  return formatted;
}

/**
 * Creates a default custom format template
 */
export function createDefaultCustomFormat(): Partial<CustomFormat> {
  return {
    name: '',
    template: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
    validation: true,
    slots: SCAFFOLD_SLOTS.map(slot => ({ ...slot }))
  };
}

/**
 * Exports custom formats to JSON
 */
export function exportCustomFormats(): string {
  const formats = getStoredCustomFormats();
  return JSON.stringify(formats, null, 2);
}

/**
 * Imports custom formats from JSON
 */
export function importCustomFormats(jsonData: string): {
  success: boolean;
  imported: number;
  errors: string[];
} {
  try {
    const data = JSON.parse(jsonData);
    
    if (!Array.isArray(data)) {
      return {
        success: false,
        imported: 0,
        errors: ['Invalid format: expected an array of custom formats']
      };
    }
    
    const errors: string[] = [];
    let imported = 0;
    
    data.forEach((format, index) => {
      try {
        // Validate format structure
        if (!format.id || !format.name || !format.template) {
          errors.push(`Format ${index + 1}: Missing required fields (id, name, template)`);
          return;
        }
        
        // Validate template
        const validation = validateCustomFormat(format.template);
        if (!validation.isValid) {
          errors.push(`Format ${index + 1} (${format.name}): ${validation.errors.join(', ')}`);
          return;
        }
        
        // Save the format
        const customFormat: CustomFormat = {
          id: format.id,
          name: format.name,
          template: format.template,
          validation: true,
          slots: format.slots || SCAFFOLD_SLOTS.map(slot => ({ ...slot }))
        };
        
        saveCustomFormat(customFormat);
        imported++;
      } catch (error) {
        errors.push(`Format ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
    
    return {
      success: imported > 0,
      imported,
      errors
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: ['Invalid JSON format']
    };
  }
}

/**
 * Gets format usage statistics
 */
export function getFormatUsageStats(): {
  totalFormats: number;
  validFormats: number;
  invalidFormats: number;
} {
  const formats = getStoredCustomFormats();
  let validFormats = 0;
  let invalidFormats = 0;
  
  formats.forEach(format => {
    const validation = validateCustomFormat(format.template);
    if (validation.isValid) {
      validFormats++;
    } else {
      invalidFormats++;
    }
  });
  
  return {
    totalFormats: formats.length,
    validFormats,
    invalidFormats
  };
}

/**
 * Clears all custom formats (with confirmation)
 */
export function clearAllCustomFormats(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CUSTOM_FORMATS_KEY);
  } catch (error) {
    console.error('Failed to clear custom formats:', error);
    throw new Error('Failed to clear custom formats');
  }
}

/**
 * Duplicates a custom format with a new ID and name
 */
export function duplicateCustomFormat(formatId: string, newName?: string): CustomFormat | null {
  const originalFormat = getCustomFormat(formatId);
  if (!originalFormat) return null;
  
  const duplicatedFormat: CustomFormat = {
    ...originalFormat,
    id: crypto.randomUUID(),
    name: newName || `${originalFormat.name} (Copy)`
  };
  
  saveCustomFormat(duplicatedFormat);
  return duplicatedFormat;
}

/**
 * Searches custom formats by name or template content
 */
export function searchCustomFormats(query: string): CustomFormat[] {
  const formats = getStoredCustomFormats();
  const lowerQuery = query.toLowerCase();
  
  return formats.filter(format => 
    format.name.toLowerCase().includes(lowerQuery) ||
    format.template.toLowerCase().includes(lowerQuery)
  );
}