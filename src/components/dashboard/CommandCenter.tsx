/**
 * Command Center Component
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Device } from '@/types';
import { useSendCommand } from '@/hooks/useFirebase';
import { Camera, Navigation2, Power, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface CommandCenterProps {
  devices: Device[];
}

export function CommandCenter({ devices }: CommandCenterProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const { mutateAsync: sendCommand } = useSendCommand();

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const commands = [
    {
      id: 'photo',
      label: 'Capture Photo',
      icon: Camera,
      color: 'text-blue-400',
      description: 'Capture photo from device camera',
    },
    {
      id: 'gps_sync',
      label: 'Sync GPS',
      icon: Navigation2,
      color: 'text-green-400',
      description: 'Force GPS data synchronization',
    },
    {
      id: 'kill_switch',
      label: 'Kill Switch',
      icon: Power,
      color: 'text-red-400',
      description: 'Terminate all connections',
      destructive: true,
    },
  ];

  const handleExecuteCommand = async (taskId: string) => {
    if (!selectedDeviceId) {
      toast.error('No device selected');
      return;
    }

    setIsExecuting(true);
    try {
      await sendCommand({
        deviceId: selectedDeviceId,
        task: taskId as any,
        status: 'pending',
      });
      toast.success(`Command "${taskId}" sent to device`);
    } catch (error) {
      toast.error('Failed to send command');
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Command Center</CardTitle>
        <CardDescription>Execute remote commands on target devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Target Device
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a0b10] border border-[#00ff41]/30 rounded text-[#00ff41] focus:border-[#00ff41] focus:outline-none"
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.model} - {device.id} ({device.status})
              </option>
            ))}
          </select>
        </div>

        {/* Device Status Alert */}
        {selectedDevice && selectedDevice.status !== 'online' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
            <AlertCircle size={18} className="text-yellow-400" />
            <span className="text-sm text-yellow-300">
              Device is {selectedDevice.status}. Commands may not execute.
            </span>
          </div>
        )}

        {/* Command Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {commands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <Button
                key={cmd.id}
                onClick={() => handleExecuteCommand(cmd.id)}
                disabled={isExecuting || !selectedDeviceId}
                className={`flex-col items-center gap-2 h-auto py-4 ${
                  cmd.destructive
                    ? 'bg-red-900/20 border border-red-600/50 hover:bg-red-900/30 text-red-400'
                    : ''
                }`}
                variant={cmd.destructive ? 'outline' : 'secondary'}
              >
                {isExecuting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Icon size={20} className={cmd.color} />
                )}
                <span className="text-xs font-medium">{cmd.label}</span>
                <span className="text-xs text-gray-500">{cmd.description}</span>
              </Button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="p-3 bg-[#0a0b10] border border-[#00ff41]/20 rounded text-xs text-gray-400">
          <p className="font-mono">
            $ Commands will be queued and executed on the next device check-in
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
