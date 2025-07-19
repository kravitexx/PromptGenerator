'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DriveAuthButtonProps {
  onAuthSuccess?: (token: string) => void;
  onAuthError?: (error: string) => void;
  className?: string;
}

export function DriveAuthButton({ onAuthSuccess, onAuthError, className }: DriveAuthButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGoogleDriveAuth = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // Create a popup window for Google OAuth
      const authUrl = new URL('https://accounts.google.com/oauth/authorize');
      authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/google/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/drive.appdata');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      const popup = window.open(
        authUrl.toString(),
        'google-drive-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open authentication popup. Please allow popups for this site.');
      }

      // Listen for the popup to close or send a message
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsAuthenticating(false);
          
          // Check if token was stored
          const token = sessionStorage.getItem('google_drive_token');
          if (token) {
            setIsAuthenticated(true);
            onAuthSuccess?.(token);
          } else {
            setError('Authentication was cancelled or failed');
            onAuthError?.('Authentication cancelled');
          }
        }
      }, 1000);

      // Listen for messages from the popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_DRIVE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          
          const { token } = event.data;
          sessionStorage.setItem('google_drive_token', token);
          setIsAuthenticated(true);
          setIsAuthenticating(false);
          onAuthSuccess?.(token);
        } else if (event.data.type === 'GOOGLE_DRIVE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          
          const errorMessage = event.data.error || 'Authentication failed';
          setError(errorMessage);
          setIsAuthenticating(false);
          onAuthError?.(errorMessage);
        }
      };

      window.addEventListener('message', messageListener);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsAuthenticating(false);
      onAuthError?.(errorMessage);
    }
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem('google_drive_token');
    setIsAuthenticated(false);
    setError(null);
  };

  // Check if already authenticated on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('google_drive_token');
      if (token) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  if (isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Google Drive Connected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-600" />
          Connect Google Drive
        </CardTitle>
        <CardDescription>
          Enable data persistence by connecting your Google Drive account.
          Your chat history and custom formats will be saved securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGoogleDriveAuth}
          disabled={isAuthenticating}
          className="w-full"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Connect Google Drive
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your data will be stored in Google Drive&apos;s secure AppDataFolder</p>
          <p>• Only this application can access your prompt generator data</p>
          <p>• You can disconnect at any time</p>
        </div>
      </CardContent>
    </Card>
  );
}