/**
 * Image Gallery Component - Display device captures in masonry grid
 * Firebase Storage integration with lazy loading
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Eye, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ImageCapture } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ImageGalleryProps {
  images: ImageCapture[];
  isLoading: boolean;
  deviceId?: string;
}

function ImageCard({ image, onDelete }: { image: ImageCapture; onDelete?: (id: string) => void }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-[#00ff41]/30 hover:border-[#00ff41]/60 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-48 object-cover cursor-pointer hover:brightness-75 transition-all"
          onClick={() => setShowPreview(true)}
        />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <div className="w-full">
          <p className="text-xs text-gray-300 font-mono truncate">{image.name}</p>
          <p className="text-xs text-[#00ff41] font-mono">
            {formatDistanceToNow(new Date(image.timestamp), { addSuffix: true })}
          </p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center gap-1 bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] px-2 py-1 rounded text-xs transition-colors"
            >
              <Eye size={14} /> View
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = image.url;
                link.download = image.name;
                link.click();
              }}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-2 py-1 rounded text-xs transition-colors"
            >
              <Download size={14} /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-4xl max-h-[80vh] rounded-lg" onClick={(e: any) => e.stopPropagation()}>
              <img
                src={image.url}
                alt={image.name}
                className="max-w-4xl max-h-[80vh] rounded-lg"
              />
            </div>
          </motion.div>
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 text-white hover:text-[#00ff41] transition-colors text-3xl font-bold"
          >
            ×
          </button>
        </div>
      )}
      </motion.div>
    </div>
  );
}

export function ImageGallery({ images, isLoading, deviceId }: ImageGalleryProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-700 rounded-lg animate-pulse border border-[#00ff41]/20"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="p-12 text-center border-[#00ff41]/30">
        <Eye size={40} className="mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400 font-mono">No captures available</p>
        {deviceId && (
          <p className="text-xs text-gray-500 mt-2">
            Awaiting image captures from device {deviceId}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 border-[#00ff41]/30">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#00ff41] font-mono">IMAGE GALLERY</h3>
          <p className="text-xs text-gray-400 font-mono">{images.length} captures</p>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          Last: {formatDistanceToNow(new Date(images[0]?.timestamp || Date.now()), { addSuffix: true })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </Card>
  );
}
