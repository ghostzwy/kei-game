/**
 * GPS Tracking Page - Detailed Table and Map
 */

'use client';

import React, { useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useDeviceLocations, useActiveDevices } from '@/hooks/useFirebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MapPin, ExternalLink, Search, Globe, Smartphone, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
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

export default function MapPage() {
  const { locations, isLoading: locationsLoading } = useDeviceLocations();
  const { devices, isLoading: devicesLoading } = useActiveDevices();
  const [searchTerm, setSearchTerm] = useState('');

  const isLoading = locationsLoading || devicesLoading;

  const enrichedLocations = useMemo(() => {
    return locations.map((loc) => {
      const device = devices.find((d) => d.id === loc.deviceId);
      return {
        ...loc,
        battery: device?.battery,
        model: device?.model || device?.deviceInfo?.model || 'Unknown',
        status: device?.status,
        ip: device?.ip || device?.deviceInfo?.ip || 'Unknown',
        appType: device?.appType,
      };
    });
  }, [locations, devices]);

  const filteredLocations = enrichedLocations.filter(loc =>
    loc.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mapCenter = useMemo(() => {
    const valid = filteredLocations.filter(l => l.lat && l.lng);
    if (valid.length > 0) {
      return [valid[0].lat, valid[0].lng] as [number, number];
    }
    return [-6.200000, 106.816666] as [number, number]; // Jakarta default
  }, [filteredLocations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#00ff41] mb-2">GPS Tracking Center</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Real-time Location Intel</p>
        </div>

        <div className="relative w-full md:w-64">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
           <input
             type="text"
             placeholder="Cari ID / Model..."
             className="w-full bg-[#0a0b10] border border-[#00ff41]/30 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#00ff41] outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className="lg:col-span-2 overflow-hidden border-[#00ff41]/20">
          <CardHeader className="border-b border-white/5 bg-black/40">
             <div className="flex items-center gap-2">
               <Globe size={18} className="text-[#00ff41]" />
               <CardTitle className="text-lg">Live Satellite View</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-0 h-[400px]">
             {isLoading ? (
               <div className="h-full flex items-center justify-center text-gray-500 font-mono animate-pulse">Scanning Satellite...</div>
             ) : (
                <MapContainer center={mapCenter} zoom={12} className="h-full">
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                   {filteredLocations.filter(l => l.lat && l.lng).map(loc => (
                     <CircleMarker key={loc.deviceId} center={[loc.lat!, loc.lng!]} radius={8} pathOptions={{color: '#00ff41', fillColor: '#00ff41', fillOpacity: 0.6}}>
                       <Popup>
                          <div className="text-slate-900 p-1">
                             <p className="font-bold border-b mb-1">{loc.deviceId}</p>
                             <p className="text-xs">Model: {loc.model}</p>
                             <p className="text-xs">IP: {loc.ip}</p>
                          </div>
                       </Popup>
                     </CircleMarker>
                   ))}
                </MapContainer>
             )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
           <div className="bg-[#0a0b10] border border-[#00ff41]/20 rounded-3xl p-6 shadow-xl">
              <p className="text-xs text-gray-500 uppercase tracking-tighter mb-1">Active Pings</p>
              <h3 className="text-3xl font-bold text-[#00ff41]">{filteredLocations.length}</h3>
              <p className="text-[10px] text-emerald-500/60 mt-2 font-mono">ENCRYPTED CONNECTION ESTABLISHED</p>
           </div>
           <div className="bg-[#0a0b10] border border-orange-500/20 rounded-3xl p-6 shadow-xl">
              <p className="text-xs text-gray-500 uppercase tracking-tighter mb-1">Last Update</p>
              <h3 className="text-lg font-mono text-orange-400">
                {filteredLocations[0]?.time ? new Date(filteredLocations[0].time).toLocaleTimeString() : 'N/A'}
              </h3>
              <p className="text-[10px] text-orange-500/60 mt-2 font-mono">SYNCING WITH FIREBASE DB</p>
           </div>
        </div>
      </div>

      {/* Detailed GPS Table */}
      <Card className="border-[#00ff41]/20 bg-black/40 backdrop-blur-md">
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#00ff41]" />
            <CardTitle>Detailed GPS Registry</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#0a0b10] text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">Device Identity</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                  <th className="px-6 py-4 font-semibold">Coordinates</th>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Navigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-600 font-mono">NO GPS DATA FOUND IN VAULT</td>
                  </tr>
                ) : (
                  filteredLocations.map((loc) => (
                    <tr key={loc.deviceId} className="hover:bg-[#00ff41]/5 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#00ff41]/10 flex items-center justify-center text-[#00ff41]">
                               <Smartphone size={14} />
                            </div>
                            <div>
                               <div className="font-bold text-white group-hover:text-[#00ff41] transition-colors">{loc.deviceId}</div>
                               <div className="text-[10px] text-gray-500">{loc.model} • {loc.appType || 'SYS'}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-blue-400">{loc.ip || '---.---.---.---'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {loc.lat ? (
                          <div className="font-mono text-xs text-gray-400">
                             {loc.lat.toFixed(6)}, {loc.lng?.toFixed(6)}
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">No Signal</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-gray-500">
                            <Clock size={12} />
                            <span className="text-xs">{loc.time ? new Date(loc.time).toLocaleString('id-ID') : 'Unknown'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        {loc.lat && (
                          <a
                            href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00ff41]/10 text-[#00ff41] text-xs hover:bg-[#00ff41]/20 border border-[#00ff41]/30 transition-all"
                          >
                            <ExternalLink size={12} />
                            Google Maps
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
