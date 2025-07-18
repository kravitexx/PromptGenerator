import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      gemini: 'available',
      database: 'not_configured',
      drive: 'not_configured',
    },
  });
}