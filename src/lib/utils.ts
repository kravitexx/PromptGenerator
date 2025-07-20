import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatMessage } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Converts base64 string to blob URL for display
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): string {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  
  return URL.createObjectURL(blob);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  try {
    // Handle null/undefined
    if (!date) {
      return 'Unknown date';
    }
    
    // Handle already formatted strings
    if (typeof date === 'string' && date.includes('Invalid')) {
      return 'Unknown date';
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return 'Unknown date';
    }
    
    // Additional check for reasonable date range (not too far in past/future)
    const now = new Date();
    const yearDiff = Math.abs(dateObj.getFullYear() - now.getFullYear());
    if (yearDiff > 100) {
      console.warn('Date seems unreasonable:', dateObj);
      return 'Unknown date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.warn('Error formatting date:', error, 'Input:', date);
    return 'Unknown date';
  }
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Downloads text as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Deserializes chat messages and fixes date objects
 */
export function deserializeChatMessages(messages: unknown[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  
  return messages.map(msg => {
    if (!msg || typeof msg !== 'object') return msg;
    
    const message = msg as any;
    
    // Fix timestamp - be very defensive about date parsing
    if (message.timestamp) {
      try {
        const date = new Date(message.timestamp);
        if (isNaN(date.getTime())) {
          // If invalid, use current time
          message.timestamp = new Date();
        } else {
          message.timestamp = date;
        }
      } catch (error) {
        console.warn('Failed to parse message timestamp:', message.timestamp);
        message.timestamp = new Date();
      }
    } else {
      message.timestamp = new Date();
    }
    
    // Fix promptData metadata createdAt if it exists
    if (message.promptData?.metadata?.createdAt) {
      try {
        const date = new Date(message.promptData.metadata.createdAt);
        if (isNaN(date.getTime())) {
          // If invalid, use current time
          message.promptData.metadata.createdAt = new Date();
        } else {
          message.promptData.metadata.createdAt = date;
        }
      } catch (error) {
        console.warn('Failed to parse promptData createdAt:', message.promptData.metadata.createdAt);
        message.promptData.metadata.createdAt = new Date();
      }
    }
    
    return message;
  });
}

/**
 * Clears corrupted localStorage data
 */
export function clearCorruptedData(): void {
  try {
    // Clear chat messages
    localStorage.removeItem('chat_messages');
    console.log('Cleared potentially corrupted chat messages from localStorage');
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

/**
 * Creates a delay/sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
