/**
 * Debouncing utilities for performance optimization
 */

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T> | undefined>;
  pending: () => boolean;
};

/**
 * Create a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastResolve: ((value: ReturnType<T>) => void) | null = null;
  let lastReject: ((reason: any) => void) | null = null;

  const debouncedFunction = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      // Cancel previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Store the latest arguments and promise handlers
      lastArgs = args;
      lastResolve = resolve;
      lastReject = reject;

      // Set new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timeoutId = null;
          lastArgs = null;
          lastResolve = null;
          lastReject = null;
        }
      }, delay);
    });
  };

  // Cancel the debounced function
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastReject) {
      lastReject(new Error('Debounced function cancelled'));
      lastReject = null;
      lastResolve = null;
      lastArgs = null;
    }
  };

  // Execute immediately with last arguments
  debouncedFunction.flush = async (): Promise<ReturnType<T> | undefined> => {
    if (timeoutId && lastArgs && lastResolve && lastReject) {
      clearTimeout(timeoutId);
      timeoutId = null;

      try {
        const result = await func(...lastArgs);
        lastResolve(result);
        return result;
      } catch (error) {
        lastReject(error);
        throw error;
      } finally {
        lastArgs = null;
        lastResolve = null;
        lastReject = null;
      }
    }
    return undefined;
  };

  // Check if function is pending
  debouncedFunction.pending = (): boolean => {
    return timeoutId !== null;
  };

  return debouncedFunction;
}

/**
 * Throttle function - limits execution to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastExecution = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecution;

    if (timeSinceLastExecution >= interval) {
      // Execute immediately
      lastExecution = now;
      func(...args);
    } else {
      // Schedule execution
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastExecution = Date.now();
        func(...args);
        timeoutId = null;
      }, interval - timeSinceLastExecution);
    }
  };
}

/**
 * Request batching utility for API calls
 */
export class RequestBatcher<T, R> {
  private batch: T[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private resolvers: Array<(value: R[]) => void> = [];
  private rejectors: Array<(reason: any) => void> = [];

  constructor(
    private batchProcessor: (items: T[]) => Promise<R[]>,
    private batchSize: number = 10,
    private batchDelay: number = 100
  ) {}

  async add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.batch.push(item);
      
      // Store resolver for this specific item
      const itemIndex = this.batch.length - 1;
      this.resolvers.push((results: R[]) => resolve(results[itemIndex]));
      this.rejectors.push(reject);

      // Process batch if it reaches the size limit
      if (this.batch.length >= this.batchSize) {
        this.processBatch();
      } else {
        // Schedule batch processing
        this.scheduleBatchProcessing();
      }
    });
  }

  private scheduleBatchProcessing(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }

  private async processBatch(): Promise<void> {
    if (this.batch.length === 0) return;

    const currentBatch = [...this.batch];
    const currentResolvers = [...this.resolvers];
    const currentRejectors = [...this.rejectors];

    // Clear current batch
    this.batch = [];
    this.resolvers = [];
    this.rejectors = [];

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    try {
      const results = await this.batchProcessor(currentBatch);
      
      // Resolve all promises with their respective results
      currentResolvers.forEach((resolve, index) => {
        resolve(results);
      });
    } catch (error) {
      // Reject all promises
      currentRejectors.forEach(reject => reject(error));
    }
  }

  // Force process current batch
  async flush(): Promise<void> {
    if (this.batch.length > 0) {
      await this.processBatch();
    }
  }

  // Get current batch size
  getBatchSize(): number {
    return this.batch.length;
  }
}

/**
 * Memoization with TTL (Time To Live)
 */
export class MemoizedCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  constructor(private ttl: number = 5 * 60 * 1000) {} // Default 5 minutes

  get(key: string): T | undefined {
    const cached = this.cache.get(key);
    
    if (!cached) return undefined;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return cached.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    
    if (!cached) return false;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
      }
    }
    
    return this.cache.size;
  }
}

/**
 * Create a memoized version of a function with TTL
 */
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 5 * 60 * 1000,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new MemoizedCache<ReturnType<T>>(ttl);

  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return JSON.stringify(args);
  };

  const getKey = keyGenerator || defaultKeyGenerator;

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}