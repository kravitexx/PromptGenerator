/**
 * Custom hook for debounced API calls with performance optimization
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { debounce, type DebouncedFunction } from '@/lib/debounce';
import { usePerformanceMonitor } from '@/lib/performance';

interface UseDebouncedApiOptions {
  delay?: number;
  immediate?: boolean;
  maxWait?: number;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDebouncedApi<TArgs extends any[], TResult>(
  apiFunction: (...args: TArgs) => Promise<TResult>,
  options: UseDebouncedApiOptions = {}
) {
  const { delay = 500, immediate = false, maxWait } = options;
  
  const [state, setState] = useState<ApiState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const { measureAsync } = usePerformanceMonitor();
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCallIdRef = useRef<string | null>(null);

  // Create debounced function
  const debouncedFunction = useRef<DebouncedFunction<typeof apiFunction>>();

  useEffect(() => {
    const wrappedFunction = async (...args: TArgs): Promise<TResult> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const callId = crypto.randomUUID();
      lastCallIdRef.current = callId;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await measureAsync(
          `debounced-api-${apiFunction.name}`,
          () => apiFunction(...args)
        );

        // Only update state if this is still the latest call
        if (lastCallIdRef.current === callId && !abortController.signal.aborted) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }

        return result;
      } catch (error) {
        // Only update state if this is still the latest call and not aborted
        if (lastCallIdRef.current === callId && !abortController.signal.aborted) {
          setState({
            data: null,
            loading: false,
            error: error as Error,
          });
        }
        throw error;
      }
    };

    debouncedFunction.current = debounce(wrappedFunction, delay);

    return () => {
      debouncedFunction.current?.cancel();
    };
  }, [apiFunction, delay, measureAsync]);

  // Execute function
  const execute = useCallback((...args: TArgs) => {
    if (immediate && !state.loading) {
      return debouncedFunction.current?.flush();
    }
    return debouncedFunction.current?.(...args);
  }, [immediate, state.loading]);

  // Cancel pending calls
  const cancel = useCallback(() => {
    debouncedFunction.current?.cancel();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  // Check if call is pending
  const isPending = useCallback(() => {
    return debouncedFunction.current?.pending() || false;
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    ...state,
    execute,
    cancel,
    reset,
    isPending,
  };
}

/**
 * Hook for debounced prompt generation
 */
export function useDebouncedPromptGeneration(delay: number = 1000) {
  const { generatePrompt } = require('@/lib/api');
  
  return useDebouncedApi(
    async (prompt: string, images?: string[]) => {
      return generatePrompt(prompt, images);
    },
    { delay, immediate: false }
  );
}

/**
 * Hook for debounced image analysis
 */
export function useDebouncedImageAnalysis(delay: number = 800) {
  const { analyzeImage } = require('@/lib/api');
  
  return useDebouncedApi(
    async (imageData: string, originalPrompt: string) => {
      return analyzeImage(imageData, originalPrompt);
    },
    { delay, immediate: false }
  );
}

/**
 * Hook for debounced search/filtering
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  return useDebouncedApi(searchFunction, { delay, immediate: false });
}

/**
 * Hook for debounced validation
 */
export function useDebouncedValidation<T>(
  validationFunction: (value: T) => Promise<{ isValid: boolean; error?: string }>,
  delay: number = 500
) {
  return useDebouncedApi(validationFunction, { delay, immediate: false });
}

/**
 * Hook for batched API calls
 */
export function useBatchedApi<TItem, TResult>(
  batchFunction: (items: TItem[]) => Promise<TResult[]>,
  batchSize: number = 10,
  batchDelay: number = 100
) {
  const [results, setResults] = useState<Map<string, TResult>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());

  const batcherRef = useRef<any>(null);

  useEffect(() => {
    const { RequestBatcher } = require('@/lib/debounce');
    batcherRef.current = new RequestBatcher(batchFunction, batchSize, batchDelay);

    return () => {
      batcherRef.current?.flush();
    };
  }, [batchFunction, batchSize, batchDelay]);

  const addItem = useCallback(async (item: TItem, itemId: string): Promise<TResult> => {
    setLoading(prev => new Set(prev).add(itemId));
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(itemId);
      return newErrors;
    });

    try {
      const result = await batcherRef.current.add(item);
      
      setResults(prev => new Map(prev).set(itemId, result));
      setLoading(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(itemId);
        return newLoading;
      });

      return result;
    } catch (error) {
      setErrors(prev => new Map(prev).set(itemId, error as Error));
      setLoading(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(itemId);
        return newLoading;
      });
      throw error;
    }
  }, []);

  const getResult = useCallback((itemId: string) => {
    return results.get(itemId);
  }, [results]);

  const isLoading = useCallback((itemId: string) => {
    return loading.has(itemId);
  }, [loading]);

  const getError = useCallback((itemId: string) => {
    return errors.get(itemId);
  }, [errors]);

  const flush = useCallback(async () => {
    if (batcherRef.current) {
      await batcherRef.current.flush();
    }
  }, []);

  const clear = useCallback(() => {
    setResults(new Map());
    setLoading(new Set());
    setErrors(new Map());
  }, []);

  return {
    addItem,
    getResult,
    isLoading,
    getError,
    flush,
    clear,
    batchSize: batcherRef.current?.getBatchSize() || 0,
  };
}