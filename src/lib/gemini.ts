import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiRequest, GeminiResponse, ImageAnalysisRequest, ImageAnalysisResponse, GeminiError } from '@/types';
import { generateId } from '@/lib/utils';

// Gemini API configuration - Updated to use latest models
const GEMINI_MODEL = 'gemini-2.5-flash'; // Use Gemini 2.5 Flash as default
const GEMINI_PRO_MODEL = 'gemini-2.5-pro'; // Use Gemini 2.5 Pro for complex tasks

// Generation configuration for different use cases
const TEXT_GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

const IMAGE_ANALYSIS_CONFIG = {
  temperature: 0.3,
  topK: 32,
  topP: 0.9,
  maxOutputTokens: 4096,
};

const CREATIVE_CONFIG = {
  temperature: 0.9,
  topK: 50,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Tests if a Gemini API key is valid by making a simple API call using the official SDK
 */
export async function testGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    // Basic format validation
    if (!apiKey || apiKey.trim().length === 0) {
      console.error('API key is empty');
      return false;
    }

    console.log('Testing API key:', apiKey.substring(0, 10) + '...');

    // Initialize the Google AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini 2.5 Pro for validation to avoid 1.5 Flash quota limits
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_PRO_MODEL, // Use Pro model for validation
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 5, // Minimal tokens to save quota
      }
    });

    console.log('Making test request to Gemini API...');

    // Make a simple test request
    const result = await model.generateContent('Hi');
    const response = await result.response;
    
    console.log('Response received:', response);
    
    // Check if we got a valid response
    if (response.candidates && response.candidates.length > 0) {
      const text = response.text();
      console.log('API key validation successful, response:', text);
      return true;
    } else {
      console.warn('No candidates in response');
      return false;
    }
  } catch (error) {
    console.error('API key test failed:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      });
      
      if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
        console.error('API key is invalid');
      } else if (errorMessage.includes('quota exceeded')) {
        console.error('API quota exceeded');
      } else if (errorMessage.includes('permission denied')) {
        console.error('API key lacks necessary permissions');
      } else if (errorMessage.includes('fetch')) {
        console.error('Network error - check internet connection');
      } else {
        console.error('Unknown error:', error.message);
      }
    }
    
    return false;
  }
}

/**
 * Alternative API key validation using direct fetch (like your browser test)
 */
export async function testGeminiApiKeyAlternative(apiKey: string): Promise<boolean> {
  try {
    console.log('Testing API key with direct fetch method...');
    
    // Test the same endpoint you used in the browser
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Direct API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Direct API validation successful, models found:', data.models?.length || 0);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Direct API validation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }
  } catch (error) {
    console.error('Direct API key test failed:', error);
    return false;
  }
}

/**
 * Third validation method using SDK with minimal request
 */
export async function testGeminiApiKeyMinimal(apiKey: string): Promise<boolean> {
  try {
    console.log('Testing API key with minimal SDK request...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini 2.5 Pro for minimal validation
    const model = genAI.getGenerativeModel({ model: GEMINI_PRO_MODEL });
    
    // Make the smallest possible request
    const result = await model.generateContent({
      contents: [{ parts: [{ text: 'test' }] }],
      generationConfig: {
        maxOutputTokens: 1,
        temperature: 0,
      }
    });
    
    const response = await result.response;
    console.log('Minimal SDK validation response received');
    
    return true;
  } catch (error) {
    console.error('Minimal SDK validation failed:', error);
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

/**
 * Makes a request to the Gemini API for prompt generation using the official SDK
 * Enhanced based on official text generation and image understanding documentation
 */
export async function generatePromptWithGemini(request: GeminiRequest): Promise<GeminiResponse> {
  const { prompt, images, apiKey } = request;

  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    // Initialize the Google AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Choose model based on complexity - use 2.5 Pro for image analysis, 2.5 Flash for text-only
    const modelName = images && images.length > 0 ? GEMINI_PRO_MODEL : GEMINI_MODEL;
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: images && images.length > 0 ? IMAGE_ANALYSIS_CONFIG : TEXT_GENERATION_CONFIG
    });

    // Prepare the content parts according to official documentation
    const parts: any[] = [];
    
    // Add text prompt first (recommended order)
    if (prompt) {
      parts.push({ text: prompt });
    }

    // Add images if provided (following image understanding documentation)
    if (images && images.length > 0) {
      images.forEach((base64Image, index) => {
        // Detect image format from base64 data
        let mimeType = 'image/jpeg'; // default
        if (base64Image.startsWith('/9j/')) {
          mimeType = 'image/jpeg';
        } else if (base64Image.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        } else if (base64Image.startsWith('R0lGODlh')) {
          mimeType = 'image/gif';
        } else if (base64Image.startsWith('UklGR')) {
          mimeType = 'image/webp';
        }

        parts.push({
          inlineData: {
            mimeType,
            data: base64Image
          }
        });
      });
    }

    console.log('Generating content with model:', modelName, 'parts:', parts.length);
    console.log('Using Gemini 2.5 models to avoid 1.5 Flash quota limits');

    // Generate content using the official SDK with proper error handling
    const result = await model.generateContent(parts);
    const response = result.response;
    
    // Check for safety ratings and blocked content
    if (response.promptFeedback?.blockReason) {
      throw new GeminiError(
        'CONTENT_BLOCKED',
        `Content was blocked: ${response.promptFeedback.blockReason}`,
        response.promptFeedback
      );
    }

    // Check if response was generated successfully
    if (!response.candidates || response.candidates.length === 0) {
      throw new GeminiError('NO_RESPONSE', 'No response candidates generated');
    }

    const candidate = response.candidates[0];
    
    // Check if candidate was blocked
    if (candidate.finishReason === 'SAFETY') {
      throw new GeminiError(
        'SAFETY_BLOCKED',
        'Response was blocked due to safety concerns',
        candidate.safetyRatings
      );
    }

    if (candidate.finishReason === 'RECITATION') {
      throw new GeminiError(
        'RECITATION_BLOCKED',
        'Response was blocked due to recitation concerns'
      );
    }

    const generatedText = response.text();
    console.log('Generated text:', generatedText.substring(0, 200) + '...');
    
    // Return response in expected format
    return {
      generatedPrompt: {
        id: generateId(),
        scaffold: [], // Will be populated by prompt parsing logic
        rawText: generatedText,
        formattedOutputs: {},
        metadata: {
          createdAt: new Date(),
          model: modelName,
          version: 1,
        },
      },
      suggestions: [],
      clarifyingQuestions: [],
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Handle Google AI SDK specific errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
        throw new GeminiError('INVALID_API_KEY', 'Invalid API key provided');
      }
      if (errorMessage.includes('quota exceeded') || errorMessage.includes('quota')) {
        throw new GeminiError('QUOTA_EXCEEDED', 'API quota exceeded. The app now uses Gemini 2.5 Pro/Flash which have separate quotas.');
      }
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        throw new GeminiError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded');
      }
      if (errorMessage.includes('model not found')) {
        throw new GeminiError('MODEL_NOT_FOUND', 'The requested model is not available');
      }
      if (errorMessage.includes('content filter') || errorMessage.includes('safety')) {
        throw new GeminiError('CONTENT_FILTERED', 'Content was filtered by safety systems');
      }
    }
    
    // Re-throw GeminiError instances
    if (error instanceof GeminiError) {
      throw error;
    }
    
    throw new GeminiError(
      'NETWORK_ERROR',
      'Failed to connect to Gemini API',
      error
    );
  }
}

/**
 * Analyzes an image using Gemini Vision with the official SDK
 * Enhanced based on official image understanding documentation
 */
export async function analyzeImageWithGemini(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
  const { image, originalPrompt, apiKey } = request;

  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    const analysisPrompt = `
You are an expert AI image analysis assistant. Analyze this image and compare it to the original prompt to provide detailed feedback.

ORIGINAL PROMPT: "${originalPrompt}"

Please provide a comprehensive analysis in the following JSON format:

{
  "description": "A detailed, objective description of what you see in the image",
  "tokenComparison": [
    {
      "token": "specific element from the prompt",
      "present": true/false,
      "confidence": 0.0-1.0,
      "suggestion": "specific improvement suggestion if missing or unclear"
    }
  ],
  "suggestions": [
    "Specific actionable suggestions for improving the prompt",
    "Focus on what could make the image match the prompt better"
  ]
}

ANALYSIS GUIDELINES:
1. Break down the original prompt into key visual elements (subjects, colors, lighting, style, composition, etc.)
2. For each element, determine if it's clearly present, partially present, or missing
3. Assign confidence scores: 1.0 = perfectly represented, 0.8-0.9 = clearly present, 0.5-0.7 = partially present, 0.0-0.4 = missing or unclear
4. Provide specific, actionable suggestions for improvement
5. Focus on visual elements that can be controlled through prompt engineering

Be thorough but concise. Analyze at least 5-10 key elements from the prompt.
`;

    // Initialize the Google AI SDK with Pro model for better image understanding
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_PRO_MODEL, // Use Pro model for better image analysis
      generationConfig: IMAGE_ANALYSIS_CONFIG
    });

    // Detect image format from base64 data
    let mimeType = 'image/jpeg'; // default
    if (image.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (image.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    } else if (image.startsWith('R0lGODlh')) {
      mimeType = 'image/gif';
    } else if (image.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }

    // Generate analysis following image understanding best practices
    const result = await model.generateContent([
      { text: analysisPrompt },
      {
        inlineData: {
          mimeType,
          data: image
        }
      }
    ]);

    const response = result.response;
    
    // Check for safety and content blocks
    if (response.promptFeedback?.blockReason) {
      throw new GeminiError(
        'CONTENT_BLOCKED',
        `Image analysis was blocked: ${response.promptFeedback.blockReason}`,
        response.promptFeedback
      );
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new GeminiError('NO_RESPONSE', 'No analysis generated');
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason === 'SAFETY') {
      throw new GeminiError(
        'SAFETY_BLOCKED',
        'Image analysis was blocked due to safety concerns',
        candidate.safetyRatings
      );
    }

    const analysisText = response.text();
    
    try {
      // Try to parse JSON response
      const analysisData = JSON.parse(analysisText);
      return {
        description: analysisData.description || analysisText,
        tokenComparison: analysisData.tokenComparison || [],
        suggestions: analysisData.suggestions || [],
      };
    } catch (parseError) {
      console.warn('Failed to parse JSON response, returning raw text:', parseError);
      // If JSON parsing fails, return the raw text as description
      return {
        description: analysisText,
        tokenComparison: [],
        suggestions: [],
      };
    }
  } catch (error) {
    console.error('Gemini image analysis error:', error);
    
    // Handle Google AI SDK specific errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
        throw new GeminiError('INVALID_API_KEY', 'Invalid API key provided');
      }
      if (errorMessage.includes('quota exceeded')) {
        throw new GeminiError('QUOTA_EXCEEDED', 'API quota exceeded');
      }
      if (errorMessage.includes('rate limit')) {
        throw new GeminiError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded');
      }
      if (errorMessage.includes('image') && errorMessage.includes('format')) {
        throw new GeminiError('INVALID_IMAGE', 'Invalid image format or corrupted image');
      }
    }
    
    // Re-throw GeminiError instances
    if (error instanceof GeminiError) {
      throw error;
    }
    
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
export function createPromptGenerationRequest(userInput: string): string {
  const systemPrompt = `
You are an expert AI image prompt engineer specializing in creating detailed, effective prompts for AI image generation models like Stable Diffusion, Midjourney, DALL-E, Imagen, and Flux.

Your task is to analyze the user's input and create an enhanced, comprehensive prompt using the 7-slot scaffold structure:

**SCAFFOLD STRUCTURE:**
- **Subject (S)**: The main subject or focus of the image (people, objects, characters)
- **Context (C)**: Setting, environment, location, or background context
- **Style (St)**: Art style, medium, artistic approach, or visual technique
- **Composition (Co)**: Camera angle, framing, perspective, and visual composition
- **Lighting (L)**: Lighting conditions, mood lighting, time of day effects
- **Atmosphere (A)**: Mood, emotion, feeling, and atmospheric qualities
- **Quality (Q)**: Technical quality specifications and rendering details

**ANALYSIS PROCESS:**
1. Identify what elements are present in the user's input
2. Determine what elements are missing or could be enhanced
3. Fill in gaps with appropriate, complementary details
4. Ensure the enhanced prompt is cohesive and well-balanced

**USER INPUT:** "${userInput}"

**RESPONSE FORMAT:**
Please provide a single, comprehensive enhanced prompt that incorporates all relevant scaffold elements. Make it detailed enough to produce high-quality results, but concise enough to be practical. Focus on:
- Vivid, specific descriptions
- Professional terminology where appropriate
- Balanced detail across all scaffold elements
- Compatibility with multiple AI image generation models

Enhanced Prompt:`;

  return systemPrompt;
}

/**
 * Generates clarifying questions based on user input using the official SDK
 */
export async function generateClarifyingQuestions(
  userInput: string,
  apiKey: string,
  currentScaffold?: string
): Promise<unknown[]> {
  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    const questionsPrompt = `
You are an AI prompt engineering assistant. Analyze the user's input and current prompt state to generate 3-5 clarifying questions that would help improve the image generation prompt.

**USER INPUT:** "${userInput}"
${currentScaffold ? `**CURRENT SCAFFOLD:** ${currentScaffold}` : ''}

Focus on areas that are:
1. Missing or vague in the current prompt
2. Could benefit from more specific details
3. Might have multiple valid interpretations
4. Could enhance the visual impact

Generate questions that are:
- Specific and actionable
- Easy to answer with concrete options
- Focused on visual elements
- Helpful for prompt improvement

Please format your response as a JSON array of question objects:
[
  {
    "id": "unique_id",
    "question": "What specific art style would you prefer?",
    "type": "select",
    "options": ["Photorealistic", "Digital Art", "Oil Painting", "Watercolor"],
    "category": "style"
  }
]

Categories should be one of: "style", "lighting", "composition", "technical"
Types should be one of: "text", "select", "multiselect"
`;

    // Initialize the Google AI SDK with appropriate configuration
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: CREATIVE_CONFIG // Use creative config for generating questions
    });

    const result = await model.generateContent(questionsPrompt);
    const response = await result.response;
    const questionsText = response.text();
    
    try {
      // Try to parse JSON response
      const questions = JSON.parse(questionsText);
      return Array.isArray(questions) ? questions : [];
    } catch {
      // If JSON parsing fails, return empty array
      return [];
    }
  } catch (error) {
    console.error('Clarifying questions generation error:', error);
    return [];
  }
}

/**
 * Generates prompt suggestions based on user input using the official SDK
 */
export async function generatePromptSuggestions(
  userInput: string,
  apiKey: string
): Promise<string[]> {
  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    const suggestionsPrompt = `
Analyze this user input for an AI image generation prompt and provide 3-5 specific, actionable suggestions for improvement:

**USER INPUT:** "${userInput}"

Focus on suggestions that would:
1. Add missing visual details
2. Improve clarity and specificity
3. Enhance the artistic quality
4. Make the prompt more effective for AI generation

Format your response as a simple JSON array of strings:
["suggestion 1", "suggestion 2", "suggestion 3"]

Each suggestion should be concise, specific, and actionable.
`;

    // Initialize the Google AI SDK with appropriate configuration
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: TEXT_GENERATION_CONFIG // Use standard config for suggestions
    });

    const result = await model.generateContent(suggestionsPrompt);
    const response = await result.response;
    const suggestionsText = response.text();
    
    try {
      // Try to parse JSON response
      const suggestions = JSON.parse(suggestionsText);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      // If JSON parsing fails, return empty array
      return [];
    }
  } catch (error) {
    console.error('Suggestions generation error:', error);
    return [];
  }
}

/**
 * Generates content with long context support
 * Based on official long context documentation
 */
export async function generateWithLongContext(
  prompt: string,
  context: string,
  apiKey: string,
  images?: string[]
): Promise<string> {
  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    // Use Pro model for long context scenarios
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_PRO_MODEL,
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 8192, // Higher limit for long context
      }
    });

    // Prepare content with context first, then prompt
    const parts: any[] = [];
    
    // Add context first (recommended for long context)
    if (context) {
      parts.push({ text: `Context: ${context}` });
    }
    
    // Add main prompt
    parts.push({ text: `Request: ${prompt}` });
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(base64Image => {
        let mimeType = 'image/jpeg';
        if (base64Image.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        } else if (base64Image.startsWith('R0lGODlh')) {
          mimeType = 'image/gif';
        } else if (base64Image.startsWith('UklGR')) {
          mimeType = 'image/webp';
        }

        parts.push({
          inlineData: {
            mimeType,
            data: base64Image
          }
        });
      });
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    
    // Handle potential blocks and safety issues
    if (response.promptFeedback?.blockReason) {
      throw new GeminiError(
        'CONTENT_BLOCKED',
        `Content was blocked: ${response.promptFeedback.blockReason}`
      );
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new GeminiError('NO_RESPONSE', 'No response generated');
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason === 'SAFETY') {
      throw new GeminiError('SAFETY_BLOCKED', 'Response blocked due to safety concerns');
    }

    return response.text();
  } catch (error) {
    console.error('Long context generation error:', error);
    
    if (error instanceof GeminiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('context length') || errorMessage.includes('too long')) {
        throw new GeminiError('CONTEXT_TOO_LONG', 'Input context is too long for the model');
      }
    }
    
    throw new GeminiError('NETWORK_ERROR', 'Failed to generate content with long context', error);
  }
}

/**
 * Generates content with streaming support
 * Based on official text generation documentation
 */
export async function generateContentStream(
  prompt: string,
  apiKey: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!apiKey) {
    throw new GeminiError('MISSING_API_KEY', 'API key is required');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: TEXT_GENERATION_CONFIG
    });

    const result = await model.generateContentStream(prompt);
    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      
      // Call the callback if provided
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    return fullText;
  } catch (error) {
    console.error('Streaming generation error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('api key not valid')) {
        throw new GeminiError('INVALID_API_KEY', 'Invalid API key provided');
      }
      if (errorMessage.includes('quota exceeded')) {
        throw new GeminiError('QUOTA_EXCEEDED', 'API quota exceeded');
      }
    }
    
    throw new GeminiError('NETWORK_ERROR', 'Failed to generate streaming content', error);
  }
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