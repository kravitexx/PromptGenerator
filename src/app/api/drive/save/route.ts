import { NextRequest, NextResponse } from 'next/server';
import { saveAllData, saveChatMessages, saveCustomFormats, saveUserPreferences } from '@/lib/googleDrive';
import { DriveError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Validate request
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    // Save data based on type
    switch (type) {
      case 'all':
        await saveAllData(data);
        break;
      
      case 'chats':
        if (!Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Chat data must be an array' },
            { status: 400 }
          );
        }
        await saveChatMessages(data);
        break;
      
      case 'customFormats':
        if (!Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Custom formats data must be an array' },
            { status: 400 }
          );
        }
        await saveCustomFormats(data);
        break;
      
      case 'userPreferences':
        if (typeof data !== 'object' || data === null) {
          return NextResponse.json(
            { error: 'User preferences must be an object' },
            { status: 400 }
          );
        }
        await saveUserPreferences(data);
        break;
      
      default:
        return NextResponse.json(
          { error: `Unknown data type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} data saved successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Drive save API error:', error);

    if (error instanceof DriveError) {
      const statusCode = error.code === 'NO_TOKEN' ? 401 : 
                        error.code === 'UNAUTHORIZED' ? 401 :
                        error.code === 'FORBIDDEN' ? 403 : 500;
      
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
        error: 'Internal server error during save operation',
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