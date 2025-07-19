/**
 * Skeleton loading components for better UX during loading states
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
    >
      {children}
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* User message skeleton */}
      <div className="flex justify-end">
        <div className="max-w-[80%] space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* Assistant message skeleton */}
      <div className="flex justify-start">
        <div className="max-w-[80%] space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScaffoldSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
};

export const PromptSwitcherSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-md" />
        ))}
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    </div>
  );
};

export const ChatHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
};

export const ImageDropZoneSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
      <div className="flex gap-2">
        <Skeleton className="h-16 w-16 rounded-md" />
        <Skeleton className="h-16 w-16 rounded-md" />
        <Skeleton className="h-16 w-16 rounded-md" />
      </div>
    </div>
  );
};

export const ApiKeyInputSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
};

export const DriveStatusSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
};

export const FormatWizardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
};

export const ClarifyModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-5 w-56" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 justify-end">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
};

export const ImageAnalysisSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ 
  showHeader?: boolean; 
  showFooter?: boolean;
  contentLines?: number;
}> = ({ 
  showHeader = true, 
  showFooter = false, 
  contentLines = 3 
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: contentLines }).map((_, index) => (
          <Skeleton 
            key={index} 
            className={cn(
              "h-4",
              index === contentLines - 1 ? "w-3/4" : "w-full"
            )} 
          />
        ))}
      </div>
      
      {showFooter && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      )}
    </div>
  );
};

// Shimmer effect for enhanced loading animation
export const ShimmerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative overflow-hidden">
      {children}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

// Add shimmer animation to global CSS
export const shimmerStyles = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`;