/**
 * Map Page - Target Location Tracker
 */

'use client';

import React, { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { useDeviceLocations, useActiveDevices } from '@/hooks/useFirebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), {
  ssr: false,
});

export default function MapPage() {
  const { locations, isLoading: locationsLoading } = useDeviceLocations();
  const { devices, isLoading: devicesLoading } = useActiveDevices();

  const isLoading = locationsLoading || devicesLoading;

  const enrichedLocations = useMemo(() => {
    return locations.map((loc) => {
      const device = devices.find((d) => d.id === loc.deviceId);
      return {
        ...loc,
        battery: device?.battery,
        model: device?.model,
        status: device?.status,
      };
    });
  }, [locations, devices]);

  const validLocations = useMemo(
    () =>
      enrichedLocations.filter((loc) => typeof loc.lat === 'number' && typeof loc.lng === 'number'),
    [enrichedLocations]
  );

  const mapCenter = useMemo(() => {
    if (validLocations.length > 0) {
      return [validLocations[0].lat, validLocations[0].lng] as [number, number];
    }
    return [0, 0] as [number, number];
  }, [validLocations]);

  const mapBounds = useMemo(() => {
    if (validLocations.length < 2) return undefined;
    return validLocations.map((loc) => [loc.lat, loc.lng] as [number, number]);
  }, [validLocations]);

  return (
    <div className="space-y-6">
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
          ) : validLocations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Tidak ada koordinat perangkat ditemukan di Firebase.
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              bounds={mapBounds}
              zoom={validLocations.length === 1 ? 10 : 2}
              scrollWheelZoom={true}
              className="h-full rounded-b-3xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {validLocations.map((loc) => (
                <CircleMarker
                  key={loc.deviceId}
                  center={[loc.lat, loc.lng]}
                  radius={9}
                  pathOptions={{ color: '#34d399', fillColor: '#34d399', fillOpacity: 0.75 }}
                >
                  <Popup>
                    <div className="space-y-2 text-sm text-slate-900 min-w-[200px]">
                      <div className="font-semibold text-lg border-b pb-2">{loc.deviceId}</div>
                      <div className="space-y-1">
                        <p><strong>Model:</strong> {loc.model || 'Unknown'}</p>
                        <p><strong>Battery:</strong> {loc.battery !== undefined ? `${loc.battery}%` : 'Unknown'}</p>
                        <p><strong>Status:</strong> {loc.status || 'Unknown'}</p>
                        <p><strong>Lat:</strong> {loc.lat.toFixed(6)}</p>
                        <p><strong>Lng:</strong> {loc.lng.toFixed(6)}</p>
                        <p><strong>Timestamp:</strong> {new Date(loc.timestamp).toLocaleString('id-ID')}</p>
                      </div>
                      <a
                        className="inline-block mt-2 text-xs text-slate-700 underline hover:text-slate-900"
                        href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=18/${loc.lat}/${loc.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in OSM
                      </a>
                    </div>
                  </Popup>
                  <Tooltip direction="top" opacity={1} permanent>
                    {loc.deviceId}
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </CardContent>
      </Card>

      {locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Location List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enrichedLocations.map((loc) => {
                const latitude = loc.latitude ?? loc.lat;
                const longitude = loc.longitude ?? loc.lng;

                return (
                  <div
                    key={loc.deviceId}
                    className="p-3 bg-[#0a0b10] border border-[#00ff41]/20 rounded flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-mono text-[#00ff41]">{loc.deviceId}</span>
                      <span className="text-xs text-gray-500">
                        Model: {loc.model || 'Unknown'} | Battery: {loc.battery !== undefined ? `${loc.battery}%` : 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {latitude !== undefined && longitude !== undefined
                        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        : 'Coordinates unavailable'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
