'use client';

import { ReactNode } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface ApiKeyGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showTitle?: boolean;
}

export function ApiKeyGuard({ children, fallback, showTitle = true }: ApiKeyGuardProps) {
  const { hasValidKey, isLoading, error } = useApiKey();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-600">Validating API key...</p>
        </div>
      </div>
    );
  }

  if (!hasValidKey) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="max-w-2xl mx-auto p-6">
        {showTitle && (
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                API Key Required
              </CardTitle>
              <CardDescription>
                You need a valid Gemini API key to access the AI-powered prompt generation features.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
        <ApiKeyInput 
          onApiKeyValidated={() => {
            // The useApiKey hook will automatically update when sessionStorage changes
            window.location.reload();
          }}
        />

        {error && (
          <Card className="mt-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component version of ApiKeyGuard
 */
export function withApiKeyGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<ApiKeyGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <ApiKeyGuard {...guardProps}>
        <Component {...props} />
      </ApiKeyGuard>
    );
  };
}