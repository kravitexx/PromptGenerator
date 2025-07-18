import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithGemini } from '@/lib/gemini';
import { compareTokensWithDescription, analyzePromptImageAlignment } from '@/lib/tokenComparison';
import { createGeneratedPrompt, analyzeInputAndPopulateScaffold } from '@/lib/promptBuilder';
import { GeminiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, originalPrompt, apiKey } = body;

    // Validate required fields
    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image data is required and must be a base64 string' },
        { status: 400 }
      );
    }

    if (!originalPrompt || typeof originalPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Original prompt is required' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate image data format
    if (!image.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      return NextResponse.json(
        { error: 'Invalid base64 image data' },
        { status: 400 }
      );
    }

    // Analyze image using Gemini Vision
    const geminiAnalysis = await analyzeImageWithGemini({
      image,
      originalPrompt,
      apiKey
    });

    // Create a prompt object for token comparison
    const scaffold = analyzeInputAndPopulateScaffold(originalPrompt);
    const promptObject = createGeneratedPrompt(scaffold, originalPrompt);

    // Perform token comparison analysis
    const tokenComparisons = compareTokensWithDescription(promptObject, geminiAnalysis.description);
    
    // Analyze overall alignment
    const alignmentAnalysis = analyzePromptImageAlignment(promptObject, tokenComparisons);

    // Combine Gemini analysis with our token comparison
    const enhancedTokenComparison = geminiAnalysis.tokenComparison.length > 0 
      ? geminiAnalysis.tokenComparison 
      : tokenComparisons;

    // Merge suggestions
    const allSuggestions = [
      ...geminiAnalysis.suggestions,
      ...alignmentAnalysis.recommendations
    ].filter((suggestion, index, array) => 
      array.indexOf(suggestion) === index // Remove duplicates
    ).slice(0, 8); // Limit to 8 suggestions

    return NextResponse.json({
      success: true,
      data: {
        description: geminiAnalysis.description,
        tokenComparison: enhancedTokenComparison,
        suggestions: allSuggestions,
        overallScore: alignmentAnalysis.overallScore,
        strengths: alignmentAnalysis.strengths,
        weaknesses: alignmentAnalysis.weaknesses,
        metadata: {
          analysisTime: Date.now(),
          promptLength: originalPrompt.length,
          tokensAnalyzed: enhancedTokenComparison.length,
          geminiAnalysisAvailable: geminiAnalysis.tokenComparison.length > 0
        }
      }
    });

  } catch (error) {
    console.error('Image analysis API error:', error);

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
        error: 'Internal server error during image analysis',
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