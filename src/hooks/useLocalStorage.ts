import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export interface SavedResult {
  id: string;
  title: string;
  data: any;
  timestamp: number;
}

export const saveResult = (title: string, data: any): string => {
  const id = Date.now().toString();
  const savedResult: SavedResult = {
    id,
    title,
    data,
    timestamp: Date.now()
  };

  const existing = JSON.parse(localStorage.getItem('savedResults') || '[]');
  const updated = [...existing, savedResult];
  localStorage.setItem('savedResults', JSON.stringify(updated));
  
  return id;
};

export const getSavedResults = (): SavedResult[] => {
  try {
    return JSON.parse(localStorage.getItem('savedResults') || '[]');
  } catch (error) {
    console.error('Error reading saved results:', error);
    return [];
  }
};

export const deleteResult = (id: string): void => {
  const existing = getSavedResults();
  const filtered = existing.filter(result => result.id !== id);
  localStorage.setItem('savedResults', JSON.stringify(filtered));
};