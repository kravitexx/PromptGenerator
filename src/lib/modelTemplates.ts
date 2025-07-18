import { ModelTemplate } from '@/types';

// Model templates for all 5 supported AI image generation engines
export const MODEL_TEMPLATES: Record<string, ModelTemplate> = {
  'stable-diffusion-3.5': {
    id: 'stable-diffusion-3.5',
    name: 'Stable Diffusion 3.5',
    format: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
    negativeFormat: 'NEG="{neg}"',
    parameters: {
      steps: 20,
      cfg_scale: 7,
      sampler: 'DPM++ 2M Karras',
    },
  },
  'midjourney-v6': {
    id: 'midjourney-v6',
    name: 'Midjourney v6',
    format: '{S}, {C}, {St}, {Co}, {L}, {A}, {Q}',
    negativeFormat: '--no {neg} --v 6 --ar {ar}',
    parameters: {
      version: 6,
      aspect_ratio: '16:9',
      stylize: 100,
    },
  },
  'dalle-3': {
    id: 'dalle-3',
    name: 'DALL·E 3',
    format: 'Illustration of {S} in {C}. {St}. {Co}. {L}. {A}. {Q}. Avoid: {neg}.',
    negativeFormat: '',
    parameters: {
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    },
  },
  'imagen-3': {
    id: 'imagen-3',
    name: 'Imagen 3',
    format: '{"text": "{S}, {C}, {St}, {Co}, {L}, {A}, {Q}", "negative_text": "{neg}"}',
    negativeFormat: '',
    parameters: {
      output_mime_type: 'image/png',
      aspect_ratio: '1:1',
      safety_filter_level: 'block_some',
    },
  },
  'flux-v9': {
    id: 'flux-v9',
    name: 'Flux v9',
    format: '{S} | {C} | {St} | {Co} | {L} | {A} | {Q}',
    negativeFormat: 'avoid="{neg}"',
    parameters: {
      guidance_scale: 3.5,
      num_inference_steps: 28,
      max_sequence_length: 256,
    },
  },
};

/**
 * Gets all available model templates
 */
export function getAllTemplates(): ModelTemplate[] {
  return Object.values(MODEL_TEMPLATES);
}

/**
 * Gets a specific model template by ID
 */
export function getTemplate(id: string): ModelTemplate | undefined {
  return MODEL_TEMPLATES[id];
}

/**
 * Gets the default template (Stable Diffusion 3.5)
 */
export function getDefaultTemplate(): ModelTemplate {
  return MODEL_TEMPLATES['stable-diffusion-3.5'];
}

/**
 * Validates if a template ID exists
 */
export function isValidTemplateId(id: string): boolean {
  return id in MODEL_TEMPLATES;
}

/**
 * Gets template names for UI display
 */
export function getTemplateNames(): Array<{ id: string; name: string }> {
  return Object.values(MODEL_TEMPLATES).map(template => ({
    id: template.id,
    name: template.name,
  }));
}

/**
 * Formats a prompt using a specific model template
 */
export function formatPromptForModel(
  scaffold: Record<string, string>,
  template: ModelTemplate,
  negativePrompt?: string
): string {
  let formatted = template.format;
  
  // Replace scaffold tokens
  Object.entries(scaffold).forEach(([key, value]) => {
    const token = `{${key}}`;
    formatted = formatted.replace(new RegExp(token, 'g'), value || '');
  });
  
  // Clean up empty tokens and extra commas/spaces
  formatted = formatted
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/,\s*$/, '') // Remove trailing comma
    .replace(/^\s*,/, '') // Remove leading comma
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Add negative prompt if provided and template supports it
  if (negativePrompt && template.negativeFormat) {
    const negFormatted = template.negativeFormat.replace('{neg}', negativePrompt);
    formatted += ` ${negFormatted}`;
  }
  
  return formatted;
}

/**
 * Extracts parameters for a specific model
 */
export function getModelParameters(templateId: string): Record<string, unknown> {
  const template = getTemplate(templateId);
  return template?.parameters || {};
}

/**
 * Checks if a template supports negative prompts
 */
export function supportsNegativePrompts(templateId: string): boolean {
  const template = getTemplate(templateId);
  return Boolean(template?.negativeFormat);
}