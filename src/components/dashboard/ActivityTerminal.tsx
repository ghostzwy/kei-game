/**
 * Activity Terminal Component
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SystemLog } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import { useSystemLogs } from '@/hooks/useFirebase';

interface ActivityTerminalProps {
  maxLines?: number;
}

export function ActivityTerminal({ maxLines = 50 }: ActivityTerminalProps) {
  const { logs, isLoading } = useSystemLogs(maxLines);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: SystemLog['type']): string => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'command':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getLogPrefix = (type: SystemLog['type']): string => {
    switch (type) {
      case 'success':
        return '[✓]';
      case 'error':
        return '[✗]';
      case 'warning':
        return '[!]';
      case 'command':
        return '[>]';
      default:
        return '[•]';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Activity Terminal</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto bg-[#0a0b10] border border-[#00ff41]/20 rounded p-4 font-mono text-sm space-y-1"
        >
          {isLoading ? (
            <div className="text-gray-500">
              <p className="animate-pulse">Loading system logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-gray-500">
              <p>$ No activity logs available</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-2 text-xs ${getLogColor(log.type)}`}
              >
                <span className="text-gray-600 flex-shrink-0">
                  {formatTimeAgo(log.timestamp)}
                </span>
                <span className="flex-shrink-0">{getLogPrefix(log.type)}</span>
                {log.deviceId && (
                  <span className="text-gray-500">[{log.deviceId}]</span>
                )}
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Terminal Stats */}
        <div className="mt-3 p-2 bg-[#0a0b10] border border-[#00ff41]/20 rounded text-xs text-gray-500">
          <p>
            {logs.length} log entries | Real-time streaming enabled
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
