/**
 * Image optimization utilities for performance improvements
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxSizeKB?: number;
}

export interface OptimizedImage {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Compress and optimize an image file
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg',
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Try different quality levels to meet size requirements
        let currentQuality = quality;
        let dataUrl = '';
        let attempts = 0;
        const maxAttempts = 5;

        do {
          dataUrl = canvas.toDataURL(`image/${format}`, currentQuality);
          const sizeKB = (dataUrl.length * 0.75) / 1024; // Approximate size in KB

          if (sizeKB <= maxSizeKB || attempts >= maxAttempts) {
            break;
          }

          currentQuality *= 0.8; // Reduce quality by 20%
          attempts++;
        } while (currentQuality > 0.1);

        const originalSize = file.size;
        const compressedSize = Math.round((dataUrl.length * 0.75));
        const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          compressionRatio,
          width: newWidth,
          height: newHeight,
          format
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    // Clean up object URL after loading
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload(); // Call the original onload
    };
  });
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // Scale down if image is larger than max dimensions
  if (originalWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
}

/**
 * Batch optimize multiple images
 */
export async function optimizeImages(
  files: File[],
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage[]> {
  const optimizationPromises = files.map(file => optimizeImage(file, options));
  return Promise.all(optimizationPromises);
}

/**
 * Convert data URL to blob for efficient storage
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Get image dimensions from file without loading full image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Progressive image loading with placeholder
 */
export class ProgressiveImageLoader {
  private static cache = new Map<string, string>();

  static async loadWithPlaceholder(
    src: string,
    placeholderQuality: number = 0.1
  ): Promise<{ placeholder: string; fullImage: string }> {
    // Check cache first
    if (this.cache.has(src)) {
      return {
        placeholder: this.cache.get(src)!,
        fullImage: src
      };
    }

    try {
      // Create low-quality placeholder
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], 'image', { type: blob.type });

      const placeholder = await optimizeImage(file, {
        maxWidth: 50,
        maxHeight: 50,
        quality: placeholderQuality,
        format: 'jpeg'
      });

      // Cache the placeholder
      this.cache.set(src, placeholder.dataUrl);

      return {
        placeholder: placeholder.dataUrl,
        fullImage: src
      };
    } catch (error) {
      console.warn('Failed to create image placeholder:', error);
      return {
        placeholder: src,
        fullImage: src
      };
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Image format detection and validation
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
  format?: string;
} {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported image format. Supported formats: ${validTypes.join(', ')}`
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Image too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
    };
  }

  return {
    isValid: true,
    format: file.type
  };
}