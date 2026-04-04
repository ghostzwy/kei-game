/**
 * Map Page - Target Location Tracker
 */

'use client';

import React, { useEffect } from 'react';
import { useDeviceLocations } from '@/hooks/useFirebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet map component
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
});

export default function MapPage() {
  const { locations, isLoading } = useDeviceLocations();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-4xl font-bold text-[#00ff41] mb-2">Target Map</h1>
        <p className="text-gray-400">Global device location tracking</p>
      </div>

      <Card className="h-96 md:h-[600px]">
        <CardHeader>
          <CardTitle>Active Device Locations ({locations.length})</CardTitle>
        </CardHeader>
        <CardContent className="h-full p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading map...
            </div>
          ) : (
            <div className="bg-[#0a0b10] rounded h-full">
              {/* Map placeholder - actual Leaflet implementation would go here */}
              <div className="flex items-center justify-center h-full border-t border-[#00ff41]/20">
                <div className="text-center">
                  <p className="text-gray-400 mb-2">📍 Map Integration</p>
                  <p className="text-xs text-gray-600">
                    Leaflet.js map would render here with device markers
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locations List */}
      {locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Location List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div
                  key={loc.deviceId}
                  className="p-3 bg-[#0a0b10] border border-[#00ff41]/20 rounded flex justify-between items-center"
                >
                  <span className="text-sm font-mono text-[#00ff41]">{loc.deviceId}</span>
                  <span className="text-xs text-gray-500">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
