'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </FirebaseContext.Provider>
  );
}

export function useFirebaseContext() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseContext must be used within FirebaseProvider');
  }
  return context;
}

export function useIsAuthenticated() {
  const { isAuthenticated, loading } = useFirebaseContext();
  return { isAuthenticated, loading };
}
