/**
 * Kill Switch Component - Emergency Self-Uninstall Command
 * Critical security feature to remotely wipe all devices
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, SkipForward, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Device } from '@/types';
import { useKillSwitch } from '@/hooks/useFirebase';

interface KillSwitchProps {
  devices: Device[];
  onSuccess?: () => void;
}

const KillSwitchWarning = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="border-2 border-red-500 rounded-lg p-8 max-w-md w-full bg-black/95">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={28} className="text-red-500 animate-pulse" />
                <h2 className="text-2xl font-bold text-red-500 font-mono">KILL SWITCH</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-300 font-mono">
                ⚠️ WARNING: This action is IRREVERSIBLE
              </p>
              <div className="bg-red-500/10 border border-red-500/50 rounded p-3">
                <p className="text-xs text-red-400 font-mono">
                  Executing KILL SWITCH will:
                </p>
                <ul className="text-xs text-red-400 font-mono mt-2 space-y-1">
                  <li>• Trigger self-uninstall on ALL associated devices</li>
                  <li>• Wipe application data and logs</li>
                  <li>• Remove application from device</li>
                  <li>• Connection to devices will be PERMANENTLY lost</li>
                  <li>• This cannot be undone</li>
                </ul>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-3">
                <p className="text-xs text-yellow-400 font-mono font-bold">
                  {`Affected Devices: ${getAllDeviceIds().length}`}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  onClose();
                  // Execute kill switch will be handled by parent component
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono"
              >
                <SkipForward size={16} className="mr-2" />
                Confirm Kill Switch
              </Button>
            </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function getAllDeviceIds() {
  return [];
}

export function KillSwitch({ devices, onSuccess }: KillSwitchProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { mutate: executeKillSwitch } = useKillSwitch();

  const handleKillSwitch = async () => {
    setIsExecuting(true);
    const deviceIds = devices.map((d) => d.id);

    executeKillSwitch(deviceIds, {
      onSuccess: () => {
        setIsExecuting(false);
        setShowWarning(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Kill switch failed:', error);
        setIsExecuting(false);
      },
    });
  };

  return (
    <>
      <Card className="border-red-500/50 bg-red-500/5 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-red-500 font-mono">KILL SWITCH</h3>
              <p className="text-xs text-gray-400 font-mono">
                Emergency self-uninstall - affects {devices.length} device{devices.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => setShowWarning(true)}
              disabled={devices.length === 0 || isExecuting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-mono text-sm font-bold transition-colors"
            >
              {isExecuting ? 'Executing...' : 'Activate'}
            </button>
          </motion.div>
        </div>
      </Card>

      <KillSwitchWarning
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
      />

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWarning(false)}>
              <div className="border-2 border-red-500 rounded-lg p-8 max-w-2xl w-full bg-black/95" onClick={(e: any) => e.stopPropagation()}>
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  <div className="text-center">
                <AlertTriangle size={48} className="mx-auto text-red-500 mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-red-500 font-mono mb-2">
                  KILL SWITCH ACTIVATION
                </h2>
                <p className="text-sm text-gray-300 font-mono mb-6">
                  FINAL WARNING - This action cannot be reversed
                </p>

                <div className="bg-red-500/20 border border-red-500/50 rounded p-4 mb-6 text-left">
                  <p className="text-xs text-red-400 font-mono">
                    Sending self-uninstall command to {devices.length} device
                    {devices.length !== 1 ? 's' : ''}...
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowWarning(false)}
                    className="flex-1 px-4 py-2 border border-gray-500 text-gray-400 hover:text-white rounded font-mono transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={handleKillSwitch}
                      disabled={isExecuting}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded font-mono font-bold transition-colors w-full"
                    >
                      {isExecuting ? '⚡ Executing...' : 'Execute Kill Switch'}
                    </button>
                  </motion.div>
                </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
