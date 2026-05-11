'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Cpu } from 'lucide-react';
import { onValue, ref } from 'firebase/database';
import { database, FIREBASE_PATHS } from '@/lib/firebase';

interface ActivityLogProps {
  targetId?: string;
}

interface LogEntry {
  id: string;
  message: string;
  timestamp?: number;
}

export default function ActivityLog({ targetId }: ActivityLogProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const logRef = ref(database, `${FIREBASE_PATHS.SYSTEM_LOGS}/${targetId}`);

    const unsubscribe = onValue(logRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logArray: LogEntry[] = Object.entries(data).map(([key, val]: any) => {
           if (typeof val === 'string') {
             return { id: key, message: val };
           }
           return {
             id: key,
             message: val.message || 'Unknown Log',
             timestamp: val.timestamp
           };
        });
        setEntries(logArray.slice(-100));
      } else {
        setEntries([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  const getLogColor = (message: string) => {
    if (message.includes('ONLINE')) return 'text-emerald-400';
    if (message.includes('OFFLINE')) return 'text-red-400';
    if (message.includes('SMS')) return 'text-cyan-400';
    if (message.includes('Photo') || message.includes('photo') || message.includes('📸')) return 'text-amber-400';
    if (message.includes('ERROR') || message.includes('error')) return 'text-red-400';
    return 'text-slate-300';
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Activity</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Live system logs</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
            <ShieldAlert size={13} className="text-red-400" />
          </div>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Cpu size={13} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* ── Terminal ── */}
      <div className="rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden">
        {/* Terminal title bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <TerminalIcon size={11} className="text-emerald-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">terminal</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/40" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
          </div>
        </div>

        {/* Log content */}
        <div
          ref={containerRef}
          className="min-h-[350px] max-h-[500px] overflow-y-auto p-4 font-mono text-[11px] leading-[1.8]"
        >
          {loading ? (
            <div className="text-slate-600 animate-pulse">Connecting...</div>
          ) : !targetId ? (
            <div className="text-slate-600">
              <span className="text-emerald-500/50">$</span> awaiting target selection...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-slate-600">
              <span className="text-emerald-500/50">$</span> no logs found for this device
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 group/line hover:bg-white/[0.01] -mx-1 px-1 rounded">
                <span className="text-emerald-500/30 select-none shrink-0">›</span>
                <span className={`whitespace-pre-wrap break-all ${getLogColor(entry.message)}`}>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
