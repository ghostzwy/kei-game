'use client';

import { useParams } from 'next/navigation';
import { useDeviceLocation } from '@/hooks/useFirebase';
import dynamic from 'next/dynamic';
import { ChevronLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-slate-900 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

export default function DeviceMapPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;
  const { location, history } = useDeviceLocation(deviceId);

  if (!location) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/dashboard/map" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
            <ChevronLeft size={20} />
            Back to GPS
          </Link>
          <div className="rounded-lg border border-white/10 bg-slate-950/85 p-8 text-center">
            <MapPin size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No location data for device: {deviceId}</p>
          </div>
        </div>
      </main>
    );
  }

  const mapCenter: [number, number] = [location.lat || -6.2, location.lng || 106.8];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard/map" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
            <ChevronLeft size={20} />
            Back to GPS
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Device Location Tracking</h1>
          <p className="text-slate-400 font-mono text-sm">{deviceId}</p>
        </div>

        {/* Map */}
        <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl overflow-hidden">
          <div className="h-[500px] rounded-2xl overflow-hidden border border-white/10">
            <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {location.lat && location.lng && (
                <CircleMarker
                  center={[location.lat, location.lng]}
                  radius={10}
                  pathOptions={{ color: '#00ff41', fillColor: '#00ff41', fillOpacity: 0.7 }}
                >
                  <Popup>
                    <div className="text-slate-900 p-2">
                      <p className="font-bold">{deviceId}</p>
                      <p className="text-xs">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Current Location</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase">Latitude</p>
                <p className="text-sm font-mono text-cyan-400">{location.lat?.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Longitude</p>
                <p className="text-sm font-mono text-cyan-400">{location.lng?.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Updated</p>
                <p className="text-sm text-slate-300">{new Date(location.timestamp || Date.now()).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Location History</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {history.slice(0, 5).map((loc, idx) => (
                <div key={idx} className="p-2 rounded border border-white/5 bg-white/5">
                  <p className="text-xs font-mono text-slate-400">
                    {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(loc.timestamp || 0).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
