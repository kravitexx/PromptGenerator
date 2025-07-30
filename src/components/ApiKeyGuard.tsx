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

  // If we have a valid key, show the children regardless of error state
  if (hasValidKey) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {showTitle && (
          <div className="text-center space-y-4">
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">API Key Required</h1>
              </div>
              <p className="text-gray-600 text-sm">
                You need a valid Gemini API key to access the AI-powered prompt generation features.
              </p>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg bg-white">
          <ApiKeyInput
            onApiKeyValidated={() => {
              window.location.reload();
            }}
          />
        </div>

        {error && (
          <div className="border border-red-200 rounded-lg bg-red-50 p-4">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
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