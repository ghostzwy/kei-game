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
    // Sync dengan node system_logs/{deviceId} seperti di KeiService.java
    const logRef = ref(database, `${FIREBASE_PATHS.SYSTEM_LOGS}/${targetId}`);

    const unsubscribe = onValue(logRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logArray: LogEntry[] = Object.entries(data).map(([key, val]: any) => {
           // Handle string format "[HH:mm] Message" or object format
           if (typeof val === 'string') {
             return { id: key, message: val };
           }
           return {
             id: key,
             message: val.message || 'Unknown Log',
             timestamp: val.timestamp
           };
        });
        // Tampilkan 100 log terbaru
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

  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500/70">System Monitor</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Live Activity Logs</h3>
          <p className="max-w-sm text-[10px] text-slate-500 uppercase font-mono mt-1">
            Real-time feed from firebase system_logs
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
             <ShieldAlert size={16} />
           </div>
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
             <Cpu size={16} />
           </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-transparent rounded-[24px] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/90">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
             <div className="flex items-center gap-2">
                <TerminalIcon size={12} className="text-rose-500" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">C2_TERMINAL_V3.0</span>
             </div>
             <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
             </div>
          </div>

          <div
            ref={containerRef}
            className="min-h-[400px] max-h-[600px] overflow-y-auto p-5 font-mono text-[12px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
          >
            {loading ? (
              <div className="text-slate-600 animate-pulse">CONNECTING TO BOT STREAM...</div>
            ) : !targetId ? (
              <div className="text-slate-600">AWAITING TARGET SELECTION...</div>
            ) : entries.length === 0 ? (
              <div className="text-slate-600 italic">No logs found for this device ID.</div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="mb-2 flex items-start gap-3 group/line">
                  <span className="text-rose-500/40 opacity-0 group-hover/line:opacity-100 transition-opacity">»</span>
                  <span className={cn(
                    "whitespace-pre-wrap",
                    entry.message.includes('ONLINE') ? "text-emerald-400" :
                    entry.message.includes('OFFLINE') ? "text-rose-400" :
                    entry.message.includes('SMS') ? "text-cyan-400" : "text-slate-300"
                  )}>
                    {entry.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
