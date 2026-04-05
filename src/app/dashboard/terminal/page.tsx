/**
 * Activity Terminal Page
 */

'use client';

import React from 'react';
import { ActivityTerminal } from '@/components/dashboard/ActivityTerminal';

export default function TerminalPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-4xl font-bold text-[#00ff41] mb-2">Activity Terminal</h1>
        <p className="text-gray-400">Real-time system and device activity logs</p>
      </div>

      <div className="flex-1 min-h-0">
        <ActivityTerminal maxLines={200} />
      </div>
    </div>
  );
}
