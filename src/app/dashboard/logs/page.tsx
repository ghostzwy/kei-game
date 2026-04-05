/**
 * System Logs Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSystemLogs } from '@/hooks/useFirebase';
import { formatTimeAgo } from '@/lib/utils';
import { Search, Filter, Download, Trash2 } from 'lucide-react';
import { SystemLog } from '@/types';

export default function LogsPage() {
  const { logs, isLoading } = useSystemLogs(500);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SystemLog['type'] | 'all'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deviceId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getLogBgColor = (type: SystemLog['type']): string => {
    switch (type) {
      case 'success':
        return 'bg-green-900/10 border-green-600/30';
      case 'error':
        return 'bg-red-900/10 border-red-600/30';
      case 'warning':
        return 'bg-yellow-900/10 border-yellow-600/30';
      case 'command':
        return 'bg-blue-900/10 border-blue-600/30';
      default:
        return 'bg-[#0a0b10] border-[#00ff41]/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#00ff41] mb-2">System Logs</h1>
        <p className="text-gray-400">Comprehensive audit trail of all system activities</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Log Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-600" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#0a0b10] border border-[#00ff41]/30 rounded text-white placeholder-gray-600 focus:border-[#00ff41] focus:outline-none"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-[#0a0b10] border border-[#00ff41]/30 rounded text-white focus:border-[#00ff41] focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="command">Command</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
              <Button variant="destructive" size="sm" className="flex-1 flex items-center gap-2">
                <Trash2 size={16} />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Total: {logs.length} events | Filtered: {filteredLogs.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No logs found</div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={
                    'p-3 border rounded flex justify-between items-start ' +
                    getLogBgColor(log.type)
                  }
                >
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        {log.type}
                      </span>
                      {log.deviceId && (
                        <span className="text-xs text-gray-600 font-mono">
                          [{log.deviceId}]
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{log.message}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              )))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
