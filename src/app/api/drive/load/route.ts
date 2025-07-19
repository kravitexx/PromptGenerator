import { NextRequest, NextResponse } from 'next/server';
import { loadAllData, loadChatMessages, loadCustomFormats, loadUserPreferences } from '@/lib/googleDrive';
import { DriveError } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data;

    // Load data based on type
    switch (type) {
      case 'all':
        data = await loadAllData();
        break;
      
      case 'chats':
        data = await loadChatMessages();
        break;
      
      case 'customFormats':
        data = await loadCustomFormats();
        break;
      
      case 'userPreferences':
        data = await loadUserPreferences();
        break;
      
      default:
        return NextResponse.json(
          { error: `Unknown data type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Drive load API error:', error);

    if (error instanceof DriveError) {
      const statusCode = error.code === 'NO_TOKEN' ? 401 : 
                        error.code === 'UNAUTHORIZED' ? 401 :
                        error.code === 'FORBIDDEN' ? 403 :
                        error.code === 'NOT_FOUND' ? 404 : 500;
      
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
        error: 'Internal server error during load operation',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, options } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    let data;

    // Handle special operations
    switch (type) {
      case 'checkAccess':
        const { checkDriveAccess } = await import('@/lib/googleDrive');
        const hasAccess = await checkDriveAccess();
        return NextResponse.json({
          success: true,
          hasAccess,
          timestamp: new Date().toISOString()
        });
      
      case 'storageInfo':
        const { getDriveStorageInfo } = await import('@/lib/googleDrive');
        const storageInfo = await getDriveStorageInfo();
        return NextResponse.json({
          success: true,
          storageInfo,
          timestamp: new Date().toISOString()
        });
      
      case 'backup':
        const { createBackup } = await import('@/lib/googleDrive');
        const backupFileName = await createBackup();
        return NextResponse.json({
          success: true,
          backupFileName,
          message: 'Backup created successfully',
          timestamp: new Date().toISOString()
        });
      
      case 'restore':
        if (!options?.backupFileName) {
          return NextResponse.json(
            { error: 'Backup file name is required for restore operation' },
            { status: 400 }
          );
        }
        const { restoreFromBackup } = await import('@/lib/googleDrive');
        await restoreFromBackup(options.backupFileName);
        return NextResponse.json({
          success: true,
          message: 'Data restored successfully from backup',
          timestamp: new Date().toISOString()
        });
      
      default:
        return NextResponse.json(
          { error: `Unknown operation type: ${type}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Drive operation API error:', error);

    if (error instanceof DriveError) {
      const statusCode = error.code === 'NO_TOKEN' ? 401 : 
                        error.code === 'UNAUTHORIZED' ? 401 :
                        error.code === 'FORBIDDEN' ? 403 :
                        error.code === 'NOT_FOUND' ? 404 : 500;
      
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
        error: 'Internal server error during operation',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}