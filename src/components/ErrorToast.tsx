'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppError, getRecoverySuggestions } from '@/lib/errorHandling';
import { 
  AlertTriangle, 
  X, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Wifi,
  Key,
  Shield,
  Clock
} from 'lucide-react';

interface ErrorToastProps {
  error: AppError;
  onDismiss: () => void;
  onRetry?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function ErrorToast({ 
  error, 
  onDismiss, 
  onRetry, 
  autoHide = false, 
  autoHideDelay = 5000 
}: ErrorToastProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide && !error.retryable) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Allow fade out animation
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, error.retryable, onDismiss]);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'NETWORK':
        return <Wifi className="h-5 w-5" />;
      case 'AUTHENTICATION':
        return <Key className="h-5 w-5" />;
      case 'PERMISSION':
        return <Shield className="h-5 w-5" />;
      case 'RATE_LIMIT':
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'NETWORK':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'AUTHENTICATION':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'PERMISSION':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'RATE_LIMIT':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  const suggestions = getRecoverySuggestions(error);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 w-96 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className={`border-l-4 ${getErrorColor()}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getErrorIcon()}
              <div>
                <h4 className="font-medium text-sm">
                  {error.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Error
                </h4>
                <p className="text-sm opacity-90 mt-1">
                  {error.userMessage || error.message}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mb-3">
            {error.retryable && onRetry && (
              <Button
                size="sm"
                onClick={onRetry}
                className="h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            
            {suggestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 text-xs opacity-70 hover:opacity-100"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide Help
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show Help
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Expanded suggestions */}
          {isExpanded && suggestions.length > 0 && (
            <div className="border-t pt-3 mt-3 opacity-90">
              <p className="text-xs font-medium mb-2">Try these solutions:</p>
              <ul className="text-xs space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-xs mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error code (development only) */}
          {process.env.NODE_ENV === 'development' && error.code && (
            <div className="border-t pt-2 mt-3">
              <p className="text-xs opacity-60">
                Error Code: {error.code}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing error toasts
export function useErrorToast() {
  const [errors, setErrors] = useState<Array<{ id: string; error: AppError }>>([]);

  const showError = (error: AppError) => {
    const id = Math.random().toString(36).substring(7);
    setErrors(prev => [...prev, { id, error }]);
  };

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    showError,
    dismissError,
    clearAllErrors,
  };
}

// Error Toast Container component
export function ErrorToastContainer() {
  const { errors, dismissError } = useErrorToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {errors.map(({ id, error }) => (
        <div key={id} className="pointer-events-auto">
          <ErrorToast
            error={error}
            onDismiss={() => dismissError(id)}
            autoHide={!error.retryable}
          />
        </div>
      ))}
    </div>
  );
}