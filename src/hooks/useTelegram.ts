'use client';

import { useState, useEffect, useCallback } from 'react';

interface TelegramPhoto {
  imageUrl: string | null;
  fileId?: string;
  timestamp?: string;
  message?: string;
  error?: string;
}

export function useTelegramPhoto() {
  const [data, setData] = useState<TelegramPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestPhoto = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/telegram/latest-photo');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch telegram photo');
      }
      
      setData(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching Telegram photo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLatestPhoto();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchLatestPhoto, 30000);
    return () => clearInterval(interval);
  }, [fetchLatestPhoto]);

  return { 
    photo: data?.imageUrl || null, 
    timestamp: data?.timestamp || null,
    isLoading, 
    error,
    refresh: fetchLatestPhoto 
  };
}
