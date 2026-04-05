import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase'; // Adjust the import based on your Firebase setup
import { Target } from '@/types';

export const useRealtimeTargets = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = db.collection('targets').onSnapshot(
      (snapshot) => {
        const targetsData: Target[] = [];
        snapshot.forEach((doc) => {
          targetsData.push({ id: doc.id, ...doc.data() } as Target);
        });
        setTargets(targetsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching targets: ", error);
        setError("Failed to load targets.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { targets, isLoading, error };
};