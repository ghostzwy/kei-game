/**
 * Device Grid Component
 */

'use client';

import React from 'react';
import { Device } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { formatTimeAgo, getStatusColor } from '@/lib/utils';
import { Smartphone, Disc3 } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
}

function DeviceCard({ device }: DeviceCardProps) {
  const statusColor = getStatusColor(device.status);

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#00ff41]" />
            <CardTitle className="text-base">{device.model}</CardTitle>
          </div>
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: statusColor }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device ID */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Device ID</p>
          <p className="text-sm font-mono text-[#00ff41] break-all">{device.id}</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-sm font-medium capitalize text-gray-300">
              {device.status}
            </span>
          </div>
        </div>

        {/* Battery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Battery</p>
            <span className="text-sm font-mono text-[#00ff41]">{device.battery ?? 0}%</span>
          </div>
          <Progress value={device.battery ?? 0} max={100} />
        </div>

        {/* Last Seen */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Last Seen</p>
          <p className="text-sm text-gray-400">
            {device.lastSeen ? formatTimeAgo(device.lastSeen) : 'Unknown'}
          </p>
        </div>

        {/* OS/IP Info */}
        {device.os && (
          <div className="flex items-center gap-2">
            <Disc3 size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">{device.os}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DeviceGridProps {
  devices: Device[];
  isLoading?: boolean;
}

export function DeviceGrid({ devices, isLoading = false }: DeviceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-64 bg-[#0a0b10]" />
          </Card>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-12 text-center">
          <Smartphone size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No devices found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
}
