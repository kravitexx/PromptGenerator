import { GeminiRequest, GeminiResponse, ImageAnalysisRequest, ImageAnalysisResponse, GeminiError } from '@/types';

// Gemini API configuration
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Tests if a Gemini API key is valid by making a simple API call
 */
export async function testGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        }),
      }
    );

    if (response.ok) {
      return true;
    } else if (response.status === 400) {
      // Check if it's a valid API key but invalid request (which is fine for testing)
      const errorData = await response.json();
      return !errorData.error?.message?.includes('API_KEY_INVALID');
    }
    
    return false;
  } catch (error) {
    console.error('API key test failed:', error);
    return false;
  }
}

/**
 * Gets the stored API key from sessionStorage
 */
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('gemini_api_key');
}

/**
 * Checks if a valid API key is available
 */
export function hasValidApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

// Types for Gemini API requests
interface GeminiTextPart {
  text: string;
}

interface GeminiImagePart {
  inline_data: {
    mime_type: string;
    data: string;
  };
}

type GeminiPart = GeminiTextPart | GeminiImagePart;

interface GeminiContent {
  parts: GeminiPart[];
}

/**
 * Makes a request to the Gemini API for prompt generation
 */
export async function generatePromptWithGemini(request: GeminiRequest): Promise<GeminiResponse> {
  const { prompt, images, apiKey } = request;

  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    const contents: GeminiContent[] = [];
    
    // Add text prompt
    if (prompt) {
      contents.push({
        parts: [{ text: prompt }]
      });
    }

    // Add images if provided
    if (images && images.length > 0) {
      const imageParts: GeminiImagePart[] = images.map(base64Image => ({
        inline_data: {
          mime_type: 'image/jpeg', // Assume JPEG for now
          data: base64Image
        }
      }));
      
      if (contents.length > 0) {
        // Add images to existing content
        contents[0].parts.push(...imageParts);
      } else {
        contents.push({
          parts: imageParts
        });
      }
    }

    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new GeminiError(
        'API_ERROR',
        errorData.error?.message || 'Failed to generate prompt',
        errorData
      );
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new GeminiError('NO_RESPONSE', 'No response generated from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // For now, return a basic response structure
    // This will be enhanced when we implement the actual prompt parsing
    return {
      generatedPrompt: {
        id: crypto.randomUUID(),
        scaffold: [], // Will be populated by prompt parsing logic
        rawText: generatedText,
        formattedOutputs: {},
        metadata: {
          createdAt: new Date(),
          model: GEMINI_MODEL,
          version: 1,
        },
      },
      suggestions: [],
      clarifyingQuestions: [],
    };
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }
    
    console.error('Gemini API error:', error);
    throw new GeminiError(
      'NETWORK_ERROR',
      'Failed to connect to Gemini API',
      error
    );
  }
}

/**
 * Analyzes an image using Gemini Vision
 */
export async function analyzeImageWithGemini(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
  const { image, originalPrompt, apiKey } = request;

  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    const analysisPrompt = `
Analyze this image and provide:
1. A detailed description of what you see
2. Compare it to this original prompt: "${originalPrompt}"
3. Identify which elements from the prompt are present or missing
4. Suggest improvements to the prompt for better results

Please format your response as JSON with the following structure:
{
  "description": "detailed description of the image",
  "tokenComparison": [
    {
      "token": "element from prompt",
      "present": true/false,
      "confidence": 0.0-1.0,
      "suggestion": "optional improvement suggestion"
    }
  ],
  "suggestions": ["list of improvement suggestions"]
}
`;

    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: analysisPrompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new GeminiError(
        'API_ERROR',
        errorData.error?.message || 'Failed to analyze image',
        errorData
      );
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new GeminiError('NO_RESPONSE', 'No analysis generated from Gemini API');
    }

    const analysisText = data.candidates[0].content.parts[0].text;
    
    try {
      // Try to parse JSON response
      const analysisData = JSON.parse(analysisText);
      return {
        description: analysisData.description || analysisText,
        tokenComparison: analysisData.tokenComparison || [],
        suggestions: analysisData.suggestions || [],
      };
    } catch {
      // If JSON parsing fails, return the raw text as description
      return {
        description: analysisText,
        tokenComparison: [],
        suggestions: [],
      };
    }
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }
    
    console.error('Gemini image analysis error:', error);
    throw new GeminiError(
      'NETWORK_ERROR',
      'Failed to analyze image with Gemini API',
      error
    );
  }
}

/**
 * Creates a prompt generation request for the Gemini API
 */
export function createPromptGenerationRequest(
  userInput: string
): string {
  const systemPrompt = `
You are an expert AI image prompt engineer. Your task is to help users create detailed, effective prompts for AI image generation.

Given the user's input, create an improved prompt that follows the 7-slot scaffold structure:
- Subject (S): The main subject or focus of the image
- Context (C): Setting, environment, or background context  
- Style (St): Art style, medium, or visual approach
- Composition (Co): Camera angle, framing, and visual composition
- Lighting (L): Lighting conditions and mood
- Atmosphere (A): Mood, emotion, and atmospheric qualities
- Quality (Q): Technical quality and rendering specifications

Please analyze the user's input and provide:
1. An enhanced prompt that fills in missing details
2. Specific suggestions for each scaffold slot
3. Alternative variations they might consider

User input: "${userInput}"

Please provide a comprehensive, detailed prompt that would work well with AI image generation models like Stable Diffusion, Midjourney, or DALL-E.
`;

  return systemPrompt;
}

/**
 * Retry mechanism for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication errors
      if (error instanceof GeminiError && error.code === 'MISSING_API_KEY') {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}