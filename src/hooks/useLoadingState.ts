'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface UseLoadingStateOptions {
  successDuration?: number;
  errorDuration?: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface LoadingStateReturn {
  state: LoadingState;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: any;
  progress: number;
  setLoading: () => void;
  setSuccess: (message?: string) => void;
  setError: (error: any) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
  executeAsync: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

export function useLoadingState(options: UseLoadingStateOptions = {}): LoadingStateReturn {
  const {
    successDuration = 2000,
    errorDuration = 5000,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<LoadingState>('idle');
  const [error, setErrorState] = useState<any>(null);
  const [progress, setProgressState] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const setLoading = useCallback(() => {
    clearTimeout();
    setState('loading');
    setErrorState(null);
    setProgressState(0);
  }, [clearTimeout]);

  const setSuccess = useCallback((message?: string) => {
    clearTimeout();
    setState('success');
    setErrorState(null);
    setProgressState(100);
    
    onSuccess?.();
    
    // Auto-reset after success duration
    timeoutRef.current = setTimeout(() => {
      setState('idle');
      setProgressState(0);
    }, successDuration);
  }, [clearTimeout, onSuccess, successDuration]);

  const setError = useCallback((errorValue: any) => {
    clearTimeout();
    setState('error');
    setErrorState(errorValue);
    setProgressState(0);
    
    onError?.(errorValue);
    
    // Auto-reset after error duration
    timeoutRef.current = setTimeout(() => {
      setState('idle');
      setErrorState(null);
    }, errorDuration);
  }, [clearTimeout, onError, errorDuration]);

  const setProgress = useCallback((newProgress: number) => {
    setProgressState(Math.max(0, Math.min(100, newProgress)));
  }, []);

  const reset = useCallback(() => {
    clearTimeout();
    setState('idle');
    setErrorState(null);
    setProgressState(0);
  }, [clearTimeout]);

  const executeAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading();
      const result = await asyncFn();
      setSuccess();
      return result;
    } catch (err) {
      setError(err);
      return null;
    }
  }, [setLoading, setSuccess, setError]);

  return {
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    error,
    progress,
    setLoading,
    setSuccess,
    setError,
    setProgress,
    reset,
    executeAsync
  };
}

// Hook for progressive loading with steps
interface UseProgressiveLoadingOptions {
  steps: string[];
  stepDuration?: number;
  onStepComplete?: (step: string, index: number) => void;
  onComplete?: () => void;
}

interface ProgressiveLoadingReturn {
  currentStep: string;
  currentStepIndex: number;
  progress: number;
  isComplete: boolean;
  start: () => void;
  nextStep: () => void;
  reset: () => void;
  setStep: (index: number) => void;
}

export function useProgressiveLoading(options: UseProgressiveLoadingOptions): ProgressiveLoadingReturn {
  const { steps, stepDuration = 1000, onStepComplete, onComplete } = options;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const currentStep = steps[currentStepIndex] || '';
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  const clearInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      onStepComplete?.(steps[newIndex], newIndex);
    } else {
      setIsComplete(true);
      clearInterval();
      onComplete?.();
    }
  }, [currentStepIndex, steps, onStepComplete, onComplete, clearInterval]);

  const start = useCallback(() => {
    setCurrentStepIndex(0);
    setIsComplete(false);
    clearInterval();
    
    if (steps.length > 0) {
      onStepComplete?.(steps[0], 0);
      
      intervalRef.current = setInterval(() => {
        nextStep();
      }, stepDuration);
    }
  }, [steps, stepDuration, onStepComplete, nextStep, clearInterval]);

  const reset = useCallback(() => {
    clearInterval();
    setCurrentStepIndex(0);
    setIsComplete(false);
  }, [clearInterval]);

  const setStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      onStepComplete?.(steps[index], index);
    }
  }, [steps, onStepComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval();
    };
  }, [clearInterval]);

  return {
    currentStep,
    currentStepIndex,
    progress,
    isComplete,
    start,
    nextStep,
    reset,
    setStep
  };
}

// Hook for managing multiple loading states
interface UseMultiLoadingStateOptions {
  keys: string[];
}

interface MultiLoadingStateReturn {
  states: Record<string, LoadingState>;
  isAnyLoading: boolean;
  isAllSuccess: boolean;
  isAnyError: boolean;
  setLoading: (key: string) => void;
  setSuccess: (key: string) => void;
  setError: (key: string, error: any) => void;
  reset: (key?: string) => void;
  executeAsync: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T | null>;
}

export function useMultiLoadingState(options: UseMultiLoadingStateOptions): MultiLoadingStateReturn {
  const { keys } = options;
  const [states, setStates] = useState<Record<string, LoadingState>>(() =>
    keys.reduce((acc, key) => ({ ...acc, [key]: 'idle' }), {})
  );
  const [errors, setErrors] = useState<Record<string, any>>({});

  const updateState = useCallback((key: string, newState: LoadingState) => {
    setStates(prev => ({ ...prev, [key]: newState }));
  }, []);

  const setLoading = useCallback((key: string) => {
    updateState(key, 'loading');
    setErrors(prev => ({ ...prev, [key]: null }));
  }, [updateState]);

  const setSuccess = useCallback((key: string) => {
    updateState(key, 'success');
    setErrors(prev => ({ ...prev, [key]: null }));
  }, [updateState]);

  const setError = useCallback((key: string, error: any) => {
    updateState(key, 'error');
    setErrors(prev => ({ ...prev, [key]: error }));
  }, [updateState]);

  const reset = useCallback((key?: string) => {
    if (key) {
      updateState(key, 'idle');
      setErrors(prev => ({ ...prev, [key]: null }));
    } else {
      setStates(keys.reduce((acc, k) => ({ ...acc, [k]: 'idle' }), {}));
      setErrors({});
    }
  }, [keys, updateState]);

  const executeAsync = useCallback(async <T>(key: string, asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(key);
      const result = await asyncFn();
      setSuccess(key);
      return result;
    } catch (err) {
      setError(key, err);
      return null;
    }
  }, [setLoading, setSuccess, setError]);

  const isAnyLoading = Object.values(states).some(state => state === 'loading');
  const isAllSuccess = Object.values(states).every(state => state === 'success');
  const isAnyError = Object.values(states).some(state => state === 'error');

  return {
    states,
    isAnyLoading,
    isAllSuccess,
    isAnyError,
    setLoading,
    setSuccess,
    setError,
    reset,
    executeAsync
  };
}