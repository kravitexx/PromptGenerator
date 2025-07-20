'use client';

import { useEffect } from 'react';
import { clearCorruptedData } from '@/lib/utils';

/**
 * Component that clears corrupted data on app startup
 */
export function DataCleaner() {
  useEffect(() => {
    // Check if we need to clear corrupted data
    const shouldClear = localStorage.getItem('data_cleaned') !== 'true';
    
    if (shouldClear) {
      console.log('Clearing potentially corrupted data...');
      clearCorruptedData();
      localStorage.setItem('data_cleaned', 'true');
    }
  }, []);

  return null; // This component doesn't render anything
}