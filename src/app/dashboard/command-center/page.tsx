/**
 * Command Center Page
 */

'use client';

import React from 'react';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { useActiveDevices } from '@/hooks/useFirebase';
import { motion } from 'framer-motion';

export default function CommandCenterPage() {
  const { devices, isLoading } = useActiveDevices();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-4xl font-bold text-[#00ff41] mb-2">Command Center</h1>
        <p className="text-gray-400">Execute remote operations on target devices</p>
      </div>

      {devices.length > 0 ? (
        <CommandCenter devices={devices} />
      ) : (
        <div className="p-8 border border-[#00ff41]/20 rounded text-center">
          <p className="text-gray-400">
            {isLoading ? 'Loading devices...' : 'No devices available'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
