/**
 * Optimized image component with lazy loading, progressive enhancement, and performance monitoring
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ProgressiveImageLoader } from '@/lib/imageOptimization';
import { usePerformanceMonitor } from '@/lib/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  lazy?: boolean;
  progressive?: boolean;
  sizes?: string;
  srcSet?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  quality = 0.8,
  priority = false,
  onLoad,
  onError,
  lazy = true,
  progressive = true,
  sizes,
  srcSet,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || '');
  const [error, setError] = useState<Error | null>(null);
  const [progressiveData, setProgressiveData] = useState<{
    placeholder: string;
    fullImage: string;
  } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const { measureAsync } = usePerformanceMonitor();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Progressive loading
  useEffect(() => {
    if (!progressive || !isInView) return;

    const loadProgressive = async () => {
      try {
        const data = await measureAsync(
          `progressive-load-${src}`,
          () => ProgressiveImageLoader.loadWithPlaceholder(src, 0.1)
        );
        setProgressiveData(data);
        setCurrentSrc(data.placeholder);
      } catch (err) {
        console.warn('Progressive loading failed:', err);
        setCurrentSrc(src);
      }
    };

    loadProgressive();
  }, [src, progressive, isInView, measureAsync]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const error = new Error(`Failed to load image: ${src}`);
    setError(error);
    onError?.(error);
  }, [src, onError]);

  // Load full resolution image after placeholder
  useEffect(() => {
    if (!isLoaded && progressiveData && currentSrc === progressiveData.placeholder) {
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(progressiveData.fullImage);
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        const error = new Error(`Failed to load full resolution image: ${src}`);
        setError(error);
        onError?.(error);
      };
      img.src = progressiveData.fullImage;
    }
  }, [isLoaded, progressiveData, currentSrc, src, onLoad, onError]);

  // Preload high priority images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (srcSet) link.setAttribute('imagesrcset', srcSet);
      if (sizes) link.setAttribute('imagesizes', sizes);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, srcSet, sizes]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
    );
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn('bg-gray-200 animate-pulse', className)}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={currentSrc || src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        srcSet={srcSet}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
            className
          )}
        >
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

/**
 * Image gallery component with optimized loading
 */
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  itemClassName?: string;
  lazy?: boolean;
  progressive?: boolean;
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  itemClassName,
  lazy = true,
  progressive = true,
  onImageClick,
}) => {
  const [loadedCount, setLoadedCount] = useState(0);

  const handleImageLoad = useCallback(() => {
    setLoadedCount(prev => prev + 1);
  }, []);

  return (
    <div className={cn('grid gap-4', className)}>
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={cn('relative cursor-pointer', itemClassName)}
          onClick={() => onImageClick?.(index)}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            lazy={lazy && index > 2} // Load first 3 images immediately
            progressive={progressive}
            priority={index < 2} // Prioritize first 2 images
            onLoad={handleImageLoad}
            className="w-full h-auto rounded-lg"
          />
        </div>
      ))}
      
      {/* Loading progress indicator */}
      {loadedCount < images.length && (
        <div className="text-center text-sm text-gray-500">
          Loading images... ({loadedCount}/{images.length})
        </div>
      )}
    </div>
  );
};

/**
 * Avatar component with optimized loading
 */
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-600',
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
      onError={handleError}
      priority={true}
      lazy={false}
    />
  );
};

/**
 * Background image component with optimization
 */
interface BackgroundImageProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt,
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [src]);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      role="img"
      aria-label={alt}
    >
      {isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {overlay && isLoaded && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};