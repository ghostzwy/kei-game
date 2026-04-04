/**
 * Overwatch v1.0 - Flying Bird Dashboard
 * Real-time Monitoring System
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Activity, Trash2 } from 'lucide-react';
import { useSystemLogs, useActiveDevices, useDeviceLocations } from '@/hooks/useFirebase';
import { formatTimeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { devices } = useActiveDevices();
  const { locations } = useDeviceLocations();
  const { logs } = useSystemLogs(50);
  const [selectedTarget] = useState('SM-G998B');
  const [cameraLoading, setCameraLoading] = useState(true);

  // Simulate camera loading
  useEffect(() => {
    const timer = setTimeout(() => setCameraLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header: Live Monitoring */}
      <div className="border-b-2 border-emerald-500/40 pb-4">
        <h1 className="text-xl font-bold text-emerald-400 font-mono tracking-wider">
          ▶ [ LIVE MONITORING ]
        </h1>
        <p className="text-xs text-emerald-500/60 mt-1 font-mono">
          Target: {selectedTarget} | Devices: {devices.length} | Last Update: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Top Row: Camera + Map + Status */}
      <div className="grid grid-cols-12 gap-4">
        {/* Camera Feed - Left (5 cols) */}
        <div className="col-span-5 border-2 border-emerald-500/40 bg-emerald-500/5 rounded overflow-hidden hover:border-emerald-400/60 transition-all">
          <div className="px-4 py-3 border-b border-emerald-500/30 flex items-center gap-2">
            <Camera size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-300 font-mono uppercase">
              [ CAM FEED ]
            </h2>
          </div>

          {/* Camera Stream */}
          <div className="bg-black aspect-video flex items-center justify-center relative overflow-hidden">
            {cameraLoading ? (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-emerald-500/60 font-mono animate-pulse">
                    ◆ INITIALIZING CAMERA...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-emerald-900/20 to-black">
                <Camera size={48} className="text-emerald-500/40 mb-2" />
                <p className="text-xs text-emerald-500/50 font-mono">[FRONT CAM]</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/30 text-xs text-emerald-500/60 font-mono">
            Resolution: 1080p | 60fps | Bitrate: 5Mbps
          </div>
        </div>

        {/* Location Map - Right Upper (5 cols) */}
        <div className="col-span-5 border-2 border-emerald-500/40 bg-emerald-500/5 rounded overflow-hidden hover:border-emerald-400/60 transition-all">
          <div className="px-4 py-3 border-b border-emerald-500/30 flex items-center gap-2">
            <MapPin size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-300 font-mono uppercase">
              [ LOCATION MAP ]
            </h2>
          </div>

          {/* Map Placeholder */}
          <div className="bg-black aspect-video flex items-center justify-center relative">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-emerald-500/50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-emerald-400 font-mono mt-3 font-bold">Bekasi, ID</p>
              <p className="text-xs text-emerald-500/60 font-mono">-6.2349° N, 107.0142° E</p>
            </div>
          </div>

          <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/30 text-xs text-emerald-500/60 font-mono">
            Accuracy: 5m | Speed: 0 km/h | Alt: 52m
          </div>
        </div>

        {/* Status Panel - Right (2 cols) */}
        <div className="col-span-2 border-2 border-emerald-500/40 bg-emerald-500/5 rounded p-3 hover:border-emerald-400/60 transition-all">
          <h2 className="text-xs font-bold text-emerald-300 font-mono uppercase mb-4 border-b border-emerald-500/30 pb-2">
            STATUS
          </h2>

          <div className="space-y-3">
            {/* Active Devices */}
            <div>
              <p className="text-xs text-emerald-500/60 font-mono mb-1">Active Devices:</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">
                {devices.filter(d => d.status === 'online').length}
              </p>
            </div>

            <div className="border-t border-emerald-500/20" />

            {/* Battery Status */}
            <div>
              <p className="text-xs text-emerald-500/60 font-mono mb-1">Avg Battery:</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">
                {devices.length > 0 
                  ? Math.round(devices.reduce((sum, d) => sum + d.battery, 0) / devices.length)
                  : 0}%
              </p>
            </div>

            <div className="border-t border-emerald-500/20" />

            {/* System Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Activity Terminal - Full Width */}
      <div className="border-2 border-emerald-500/40 bg-emerald-500/5 rounded overflow-hidden hover:border-emerald-400/60 transition-all">
        <div className="px-4 py-3 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-300 font-mono uppercase">
              [ ACTIVITY LOGS ]
            </h2>
          </div>
          <button className="text-xs px-2 py-1 border border-red-500/30 text-red-400/70 hover:border-red-400 hover:text-red-400 rounded transition-all flex items-center gap-1 font-mono">
            <Trash2 size={12} />
            Wipe
          </button>
        </div>

        {/* Log Viewer */}
        <div className="bg-black max-h-64 overflow-y-auto p-4 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-xs text-emerald-500/40">$ No activity logs available</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-2 text-xs hover:bg-emerald-500/10 px-2 py-1 rounded transition-all"
                >
                  <span className="text-emerald-500/60 flex-shrink-0">
                    [{formatTimeAgo(log.timestamp).padStart(10)}]
                  </span>
                  <span className="text-emerald-500/80">›</span>
                  {log.deviceId && (
                    <span className="text-emerald-600 flex-shrink-0">
                      [{log.deviceId}]
                    </span>
                  )}
                  <span className="text-emerald-400/70 flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/30 text-xs text-emerald-500/60 font-mono flex justify-between">
          <span>Total Events: {logs.length}</span>
          <span>Streaming: ●</span>
        </div>
      </div>
    </motion.div>
  );
}


      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card className="border-[#00ff41]/30 bg-black p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-2">TOTAL TARGETS</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Database className="text-[#00ff41]" size={24} />
          </div>
        </Card>

        <Card className="border-[#00ff41]/30 bg-black p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-2">ONLINE</p>
              <p className="text-3xl font-bold text-green-400">{stats.online}</p>
            </div>
            <Radio className="text-green-400" size={24} />
          </div>
        </Card>

        <Card className="border-[#00ff41]/30 bg-black p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-2">AVG BATTERY</p>
              <p className="text-3xl font-bold">{stats.avgBattery}%</p>
            </div>
            <Zap className="text-[#00ff41]" size={24} />
          </div>
        </Card>
      </motion.div>

      {/* Devices List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-bold font-mono">▶ ACTIVE TARGETS</h2>
        </div>
        <Card className="border-[#00ff41]/30 bg-black">
          {devices.map((device, idx) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-4 border-b border-[#00ff41]/10 last:border-0 hover:bg-[#00ff41]/5 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-lg">{device.name}</p>
                  <p className="text-xs text-gray-500">ID: {device.id}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded font-mono text-sm font-bold ${
                    device.status === 'online'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {device.status.toUpperCase()}
                  </div>
                  <p className="text-sm mt-1">{device.battery}% BATTERY</p>
                </div>
              </div>
            </motion.div>
          ))}
        </Card>
      </motion.div>

      {/* Status Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 border border-[#00ff41]/20 rounded font-mono text-sm"
      >
        <p>✓ Dashboard initialized successfully</p>
        <p className="text-gray-600 mt-2">Status: ONLINE | Devices connected: {stats.total} | Auth: VERIFIED</p>
      </motion.div>
    </div>
  );
}
