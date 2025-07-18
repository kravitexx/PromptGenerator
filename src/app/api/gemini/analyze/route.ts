import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithGemini, retryApiCall } from '@/lib/gemini';
import { GeminiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, originalPrompt, apiKey } = body;

    // Validate required fields
    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image is required and must be a base64 string' },
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

    // Validate base64 image format (more lenient check)
    if (image.length < 100) {
      return NextResponse.json(
        { error: 'Image data appears to be too small' },
        { status: 400 }
      );
    }

    // Validate image size (approximate check for base64)
    const imageSizeBytes = (image.length * 3) / 4;
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (imageSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: 'Image is too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (originalPrompt.length > 1000) {
      return NextResponse.json(
        { error: 'Original prompt is too long. Maximum 1000 characters allowed.' },
        { status: 400 }
      );
    }

    // Analyze the image using Gemini Vision with retry mechanism
    const analysisResult = await retryApiCall(
      () => analyzeImageWithGemini({
        image,
        originalPrompt,
        apiKey,
      }),
      3,
      1000
    );

    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        metadata: {
          processingTime: Date.now(),
          originalPromptLength: originalPrompt.length,
          imageSize: imageSizeBytes,
          analysisType: 'gemini_vision',
        },
      },
    });
  } catch (error) {
    console.error('Gemini analyze API error:', error);

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