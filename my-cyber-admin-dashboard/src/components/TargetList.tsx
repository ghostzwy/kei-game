'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRealtimeTargets } from '@/hooks/useRealtimeTargets';
import { formatDistanceToNow } from '@/lib/utils';
import { Target } from '@/types';

const TargetList: React.FC = () => {
  const { targets, isLoading } = useRealtimeTargets();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTargets = targets.filter((target) =>
    target.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#00ff41] mb-2">Targets</h1>
        <input
          type="text"
          placeholder="Search targets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-[#0a0b10] border border-[#00ff41]/30 rounded text-white placeholder-gray-600 focus:border-[#00ff41] focus:outline-none"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Targets ({filteredTargets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading targets...</div>
            ) : filteredTargets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No targets found</div>
            ) : (
              filteredTargets.map((target: Target) => (
                <div key={target.id} className="p-3 border rounded flex justify-between items-center bg-gray-800 border-gray-700">
                  <div className="flex-1">
                    <h2 className="text-lg text-white">{target.name}</h2>
                    <p className="text-sm text-gray-400">Status: {target.status}</p>
                    <p className="text-sm text-gray-400">Battery: {target.batteryLevel}%</p>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(target.lastActive))} ago</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">View</Button>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TargetList;