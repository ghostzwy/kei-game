/**
 * System Logs Page
 */

'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSystemLogs } from '@/hooks/useFirebase';
import { formatTimeAgo } from '@/lib/utils';
import { Search } from 'lucide-react';
import { SystemLog } from '@/types';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

export default function LogsPage() {
  const { logs, isLoading } = useSystemLogs(500);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SystemLog['type'] | 'all'>('all');

  const filteredLogs = logs.filter((log) => {
    // Handle both string and object log formats
    const messageText = typeof log === 'string' ? log : (log.message || '');
    const deviceId = typeof log === 'object' ? (log.deviceId || log.device_id || '') : '';
    
    const matchesSearch =
      messageText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deviceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const logType = typeof log === 'object' ? log.type : 'info';
    const matchesType = filterType === 'all' || logType === filterType;
    return matchesSearch && matchesType;
  });

  // Add key to force re-render when logs change
  const logsKey = logs.map(l => (typeof l === 'string' ? l : l.id)).join(',');

  return (
    <main key={logsKey} className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-300/80">System Monitor</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Live Activity Logs</h1>
              <p className="mt-2 text-sm text-slate-400">Real-time feed dari Firebase system_logs</p>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Logs</p>
                <p className="mt-2 text-2xl font-semibold text-rose-400">{logs.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filtered</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-400">{filteredLogs.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>

            {/* Filter by Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-white focus:border-cyan-400 focus:outline-none transition"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="command">Command</option>
              </select>
            </div>
          </div>
        </section>

        {/* Logs Stream */}
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 shadow-2xl shadow-slate-950/40 backdrop-blur-xl overflow-hidden">
          <div className="max-h-[700px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No logs found</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredLogs.map((log, idx) => {
                  const messageText = typeof log === 'string' ? log : (log.message || '');
                  const logType = typeof log === 'object' ? log.type : 'info';
                  const deviceId = typeof log === 'object' ? (log.deviceId || log.device_id) : null;
                  const timestamp = typeof log === 'object' ? log.timestamp : Date.now();

                  return (
                    <div key={log.id || idx} className="p-4 hover:bg-white/5 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={cn(
                              'text-xs font-mono font-bold px-2 py-1 rounded',
                              logType === 'error' && 'bg-red-500/20 text-red-300',
                              logType === 'success' && 'bg-emerald-500/20 text-emerald-300',
                              logType === 'warning' && 'bg-yellow-500/20 text-yellow-300',
                              logType === 'command' && 'bg-blue-500/20 text-blue-300',
                              logType === 'info' && 'bg-slate-500/20 text-slate-300'
                            )}>
                              {logType.toUpperCase()}
                            </span>
                            {deviceId && (
                              <span className="text-xs text-slate-400 font-mono bg-slate-900/50 px-2 py-1 rounded">
                                {deviceId}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 break-words">{messageText}</p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap font-mono">
                          {formatTimeAgo(timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );

  
}
