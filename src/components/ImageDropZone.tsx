'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validateImageFile } from '@/lib/validation';
import { fileToBase64, formatFileSize } from '@/lib/utils';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ImageFile {
  id: string;
  file: File;
  base64: string;
  preview: string;
}

interface ImageDropZoneProps {
  onImagesChange?: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export function ImageDropZone({ 
  onImagesChange, 
  maxImages = 5, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: ImageDropZoneProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setIsProcessing(true);

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Check if adding these files would exceed the limit
    if (images.length + validFiles.length > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed`);
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      setIsProcessing(false);
      return;
    }

    try {
      // Process valid files with optimization
      const newImages: ImageFile[] = [];
      
      for (const file of validFiles) {
        // Optimize image if it's large
        let processedFile = file;
        if (file.size > 1024 * 1024) { // 1MB threshold
          try {
            const { optimizeImage } = await import('@/lib/imageOptimization');
            const optimized = await optimizeImage(file, {
              maxWidth: 1024,
              maxHeight: 1024,
              quality: 0.8,
              maxSizeKB: 500
            });
            
            // Convert optimized data URL back to file
            const response = await fetch(optimized.dataUrl);
            const blob = await response.blob();
            processedFile = new File([blob], file.name, { type: 'image/jpeg' });
            
            console.log(`Image optimized: ${file.name}`, {
              originalSize: `${(file.size / 1024).toFixed(1)}KB`,
              optimizedSize: `${(processedFile.size / 1024).toFixed(1)}KB`,
              compressionRatio: `${(optimized.compressionRatio * 100).toFixed(1)}%`
            });
          } catch (optimizationError) {
            console.warn('Image optimization failed, using original:', optimizationError);
          }
        }
        
        const base64 = await fileToBase64(processedFile);
        const preview = URL.createObjectURL(processedFile);
        
        newImages.push({
          id: crypto.randomUUID(),
          file: processedFile,
          base64,
          preview,
        });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      
      // Notify parent component
      if (onImagesChange) {
        onImagesChange(updatedImages.map(img => img.base64));
      }
    } catch (error) {
      console.error('Failed to process images:', error);
      setError('Failed to process images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [images, maxImages, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const removeImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => {
      if (img.id === imageId) {
        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(img.preview);
        return false;
      }
      return true;
    });
    
    setImages(updatedImages);
    
    if (onImagesChange) {
      onImagesChange(updatedImages.map(img => img.base64));
    }
  }, [images, onImagesChange]);

  const clearAllImages = useCallback(() => {
    // Clean up all object URLs
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setError(null);
    
    if (onImagesChange) {
      onImagesChange([]);
    }
  }, [images, onImagesChange]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <Card
        className={`transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-dashed border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-6 text-center">
          {isProcessing ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">Processing images...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  Drop images here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JPEG, PNG, WebP up to {formatFileSize(maxFileSize)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">
                {images.length} image{images.length > 1 ? 's' : ''} selected
              </span>
              <Badge variant="secondary" className="text-xs">
                {images.length}/{maxImages}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllImages}
              disabled={disabled}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* File info */}
                <div className="mt-1 space-y-1">
                  <p className="text-xs font-medium truncate" title={image.file.name}>
                    {image.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(image.file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>• Images will be analyzed to provide feedback on your generated prompts</p>
        <p>• Maximum {maxImages} images, up to {formatFileSize(maxFileSize)} each</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
      </div>
    </div>
  );
}