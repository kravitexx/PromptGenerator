'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Bot, 
  Sparkles, 
  Image as ImageIcon,
  Zap,
  Brain
} from 'lucide-react';

interface LoadingStatesProps {
  type: 'generating' | 'analyzing' | 'processing' | 'thinking';
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingStates({ 
  type, 
  message, 
  progress, 
  className 
}: LoadingStatesProps) {
  const getLoadingConfig = () => {
    switch (type) {
      case 'generating':
        return {
          icon: Sparkles,
          title: 'Generating Enhanced Prompt',
          defaultMessage: 'AI is analyzing your input and creating an optimized prompt...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'analyzing':
        return {
          icon: ImageIcon,
          title: 'Analyzing Image',
          defaultMessage: 'AI is examining your image and comparing it with the prompt...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case 'processing':
        return {
          icon: Zap,
          title: 'Processing Request',
          defaultMessage: 'Processing your request and preparing the response...',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        };
      case 'thinking':
        return {
          icon: Brain,
          title: 'AI Thinking',
          defaultMessage: 'AI is thinking about the best way to help you...',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      default:
        return {
          icon: Loader2,
          title: 'Loading',
          defaultMessage: 'Please wait...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const config = getLoadingConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className={className}>
      {/* Chat message style loading */}
      <div className="flex gap-3 justify-start">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${config.bgColor} rounded-full flex items-center justify-center`}>
            <Bot className={`h-4 w-4 ${config.color}`} />
          </div>
        </div>
        
        <Card className="max-w-[80%] border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${config.color} ${type !== 'thinking' ? 'animate-spin' : 'animate-pulse'}`} />
              <span className="text-sm font-medium">{config.title}</span>
              <Badge variant="secondary" className="text-xs">
                AI Working
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {displayMessage}
            </p>

            {/* Progress bar if progress is provided */}
            {typeof progress === 'number' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      config.color.replace('text-', 'bg-')
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Animated dots for indeterminate progress */}
            {typeof progress !== 'number' && (
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 ${config.color.replace('text-', 'bg-')} rounded-full animate-bounce`} />
                <div className={`w-1 h-1 ${config.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }} />
                <div className={`w-1 h-1 ${config.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton loading component for chat messages
export function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={`flex gap-3 justify-start ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
      
      <div className="max-w-[80%] space-y-2">
        <div className="bg-gray-200 rounded-lg p-3 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Typing indicator component
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={`flex gap-3 justify-start ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <span className="text-sm text-gray-600 ml-2">AI is typing...</span>
      </div>
    </div>
  );
}

// Error state component
export function ErrorState({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string; 
  onRetry?: () => void; 
  className?: string; 
}) {
  return (
    <div className={`flex gap-3 justify-start ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-red-600" />
        </div>
      </div>
      
      <Card className="max-w-[80%] border-l-4 border-l-red-500">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-red-700">Error</span>
            <Badge variant="destructive" className="text-xs">
              Failed
            </Badge>
          </div>
          
          <p className="text-sm text-red-600 mb-3">
            {error}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}