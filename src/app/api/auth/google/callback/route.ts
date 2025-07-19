import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_DRIVE_AUTH_ERROR',
              error: '${error}'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (!code) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_DRIVE_AUTH_ERROR',
              error: 'No authorization code received'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error_description || 'Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    if (!access_token) {
      throw new Error('No access token received');
    }

    // Return success page that sends token to parent window
    return new NextResponse(`
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>✅ Google Drive Connected Successfully!</h2>
            <p>You can close this window now.</p>
          </div>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_DRIVE_AUTH_SUCCESS',
              token: '${access_token}',
              refreshToken: '${refresh_token || ''}'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    return new NextResponse(`
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Authentication Failed</h2>
            <p>${errorMessage}</p>
            <p>You can close this window and try again.</p>
          </div>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_DRIVE_AUTH_ERROR',
              error: '${errorMessage}'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}