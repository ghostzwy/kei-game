'use client';

import React, { useState } from 'react';
import { Shield, Database, Radio, Zap, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [devices] = useState([
    { id: '1', name: 'Target-001', status: 'online', battery: 85 },
    { id: '2', name: 'Target-002', status: 'online', battery: 92 },
    { id: '3', name: 'Target-003', status: 'offline', battery: 45 },
  ]);

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    avgBattery: Math.round(devices.reduce((sum, d) => sum + d.battery, 0) / devices.length),
  };

  const handleLogout = () => {
    localStorage.removeItem('kei_user');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-black text-[#00ff41] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold font-mono tracking-wider mb-2">[KEI DASHBOARD]</h1>
          <p className="text-gray-400 font-mono text-sm">v3.0 - Military Grade Command Center</p>
        </div>
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-mono flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      {/* Devices List */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold font-mono">▶ ACTIVE TARGETS</h2>
        </div>
        <Card className="border-[#00ff41]/30 bg-black">
          {devices.map((device) => (
            <div
              key={device.id}
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
            </div>
          ))}
        </Card>
      </div>

      {/* Status Footer */}
      <div className="mt-8 p-4 border border-[#00ff41]/20 rounded font-mono text-sm">
        <p>✓ Dashboard initialized successfully</p>
        <p className="text-gray-600 mt-2">Status: ONLINE | Devices connected: {stats.total} | Auth: VERIFIED</p>
      </div>
    </div>
  );
}
