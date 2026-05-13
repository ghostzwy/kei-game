'use client';

import { useState, useEffect, useCallback } from 'react';

interface TelegramPhoto {
  imageUrl: string;
  fileId: string;
  timestamp: string;
}

export function useTelegramPhoto() {
  const [photos, setPhotos] = useState<TelegramPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/telegram/latest-photo');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch telegram photos');
      }
      
      setPhotos(result.photos || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching Telegram photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPhotos();
    
    // Auto refresh every 45 seconds to avoid rate limits with many images
    const interval = setInterval(fetchPhotos, 45000);
    return () => clearInterval(interval);
  }, [fetchPhotos]);

  return { 
    photos, 
    isLoading, 
    error,
    refresh: fetchPhotos 
  };
}
