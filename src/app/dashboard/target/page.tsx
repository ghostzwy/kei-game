'use client';

import { useEffect, useState } from 'react';
import TargetList from '@/components/TargetList';
import { subscribeToTargets, sendCommand } from '@/services/targetService';
import { Target } from '@/types/target';

export default function TargetPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [busyTargetId, setBusyTargetId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTargets((incomingTargets: Target[] = []) => {
      setTargets(incomingTargets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedTargetId && targets.length > 0) {
      setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId]);

  const handleCapture = async (deviceId: string) => {
    setBusyTargetId(deviceId);
    try {
      await sendCommand(deviceId, 'capture_photo');
    } finally {
      setBusyTargetId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-[1480px]">
        <TargetList
          targets={targets}
          loading={loading}
          selectedTargetId={selectedTargetId ?? undefined}
          onSelect={(deviceId) => setSelectedTargetId(deviceId)}
          onCapture={handleCapture}
          busyTargetId={busyTargetId}
        />
      </div>
    </main>
  );
}
