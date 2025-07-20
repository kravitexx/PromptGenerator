import { NextRequest, NextResponse } from 'next/server';
import { 
  generatePromptWithGemini, 
  createPromptGenerationRequest, 
  generateClarifyingQuestions,
  generatePromptSuggestions,
  retryApiCall 
} from '@/lib/gemini';
import { analyzeInputAndPopulateScaffold, createGeneratedPrompt } from '@/lib/promptBuilder';
import { GeminiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, images, apiKey, includeQuestions = true, includeSuggestions = true } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate images array if provided
    if (images && (!Array.isArray(images) || images.some(img => typeof img !== 'string'))) {
      return NextResponse.json(
        { error: 'Images must be an array of base64 strings' },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum 2000 characters allowed.' },
        { status: 400 }
      );
    }

    // Create enhanced prompt request for Gemini
    const enhancedPrompt = createPromptGenerationRequest(prompt);

    // Generate enhanced prompt using Gemini with retry mechanism
    let geminiResponse;
    try {
      geminiResponse = await retryApiCall(
        () => generatePromptWithGemini({
          prompt: enhancedPrompt,
          images: images || [],
          apiKey,
        }),
        3,
        1000
      );
    } catch (error) {
      console.error('Gemini API call failed:', error);
      // Continue with basic scaffold if Gemini fails
      geminiResponse = { generatedPrompt: null };
    }

    // Analyze the user's original input and populate scaffold
    const populatedScaffold = analyzeInputAndPopulateScaffold(prompt);

    let finalPrompt;
    let enhancedText = prompt;
    let suggestions: string[] = [];
    let clarifyingQuestions: unknown[] = [];

    // If Gemini provided a better prompt, use it to further enhance the scaffold
    if (geminiResponse.generatedPrompt && geminiResponse.generatedPrompt.rawText) {
      enhancedText = geminiResponse.generatedPrompt.rawText;
      const enhancedScaffold = analyzeInputAndPopulateScaffold(
        enhancedText,
        populatedScaffold
      );
      
      // Create the final generated prompt with enhanced scaffold
      finalPrompt = createGeneratedPrompt(enhancedScaffold, enhancedText);
    } else {
      // Fallback to basic scaffold population if Gemini didn't provide enhancement
      finalPrompt = createGeneratedPrompt(populatedScaffold, prompt);
    }

    // Generate additional content in parallel if requested
    const additionalPromises = [];

    if (includeSuggestions) {
      additionalPromises.push(
        retryApiCall(() => generatePromptSuggestions(prompt, apiKey), 2, 500)
          .catch(() => ['Consider adding more specific details about style and composition'])
      );
    }

    if (includeQuestions) {
      additionalPromises.push(
        retryApiCall(() => generateClarifyingQuestions(prompt, apiKey), 2, 500)
          .catch(() => [])
      );
    }

    // Wait for additional content generation
    if (additionalPromises.length > 0) {
      const results = await Promise.all(additionalPromises);
      if (includeSuggestions) suggestions = results[0] as string[];
      if (includeQuestions) clarifyingQuestions = results[includeSuggestions ? 1 : 0] as unknown[];
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedPrompt: finalPrompt,
        originalInput: prompt,
        enhancedText,
        suggestions,
        clarifyingQuestions,
        metadata: {
          processingTime: Date.now(),
          hasImages: Boolean(images && images.length > 0),
          enhancementApplied: enhancedText !== prompt,
        },
      },
    });
  } catch (error) {
    console.error('Gemini generate API error:', error);

    if (error instanceof GeminiError) {
      const statusCode = error.code === 'MISSING_API_KEY' ? 401 : 
                        error.code === 'API_ERROR' ? 400 : 500;
      
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}