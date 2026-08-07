'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiMapPin, FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string;
  metadata?: Record<string, any>;
}

interface GeoMapProps {
  markers?: MapMarker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  clustering?: boolean;
}

export default function GeoMap({
  markers = [],
  center: _center = { latitude: 39.9, longitude: 32.8 },
  zoom: _zoom = 6,
  className = '',
  onMarkerClick,
  clustering: _clustering = true,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      addMarkers();
      calculateBounds();
    }
  }, [markers]);

  const initializeMap = async () => {
    try {
      // MapLibre GL initialization would go here
      // import maplibregl from 'maplibre-gl';
      // const map = new maplibregl.Map({
      //   container: containerRef.current!,
      //   style: 'https://demotiles.maplibre.org/style.json',
      //   center: [center.longitude, center.latitude],
      //   zoom: zoom,
      // });

      // mapRef.current = map;
      setLoading(false);
    } catch (error) {
      console.error('Map initialization failed:', error);
      setLoading(false);
    }
  };

  const addMarkers = () => {
    if (!mapRef.current) return;

    markers.forEach((_marker) => {
      // With MapLibre GL:
      // const el = document.createElement('div');
      // el.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer';
      // const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
      //   `<div class="text-sm font-medium">${marker.name}</div>`
      // );
      // new maplibregl.Marker(el)
      //   .setLngLat([marker.longitude, marker.latitude])
      //   .setPopup(popup)
      //   .addTo(mapRef.current);
    });
  };

  const calculateBounds = () => {
    if (markers.length === 0) return;

    const lats = markers.map((m) => m.latitude);
    const lons = markers.map((m) => m.longitude);

    setBounds({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons),
    });
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      // mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      // mapRef.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (mapRef.current && bounds) {
      // mapRef.current.fitBounds(
      //   [[bounds.west, bounds.south], [bounds.east, bounds.north]],
      //   { padding: 50 }
      // );
    }
  };

  return (
    <div className={`relative w-full h-96 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full">
        {/* MapLibre GL canvas */}
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <p className="text-slate-400 text-sm">Harita yükleniyor...</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
              <FiMapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">
                MapLibre GL harita
                <br />
                ({markers.length} işaret)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 bg-white rounded-lg border border-slate-200 shadow-sm p-2">
        <button
          onClick={handleZoomIn}
          title="Yakınlaş"
          className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
        >
          <FiZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Uzaklaş"
          className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
        >
          <FiZoomOut size={18} />
        </button>
        {bounds && (
          <button
            onClick={handleFitBounds}
            title="Tümünü göster"
            className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <FiMaximize2 size={18} />
          </button>
        )}
      </div>

      {/* Marker list */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 max-h-40 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-200">
            {markers.slice(0, 5).map((marker) => (
              <button
                key={marker.id}
                onClick={() => {
                  setSelectedMarker(marker);
                  onMarkerClick?.(marker);
                }}
                className={`w-48 px-3 py-2 text-sm text-left hover:bg-red-50 transition-colors ${
                  selectedMarker?.id === marker.id ? 'bg-red-50' : ''
                }`}
              >
                <p className="font-medium text-slate-900">{marker.name}</p>
                <p className="text-xs text-slate-500">
                  {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                </p>
              </button>
            ))}
            {markers.length > 5 && (
              <div className="px-3 py-2 text-xs text-slate-500">+{markers.length - 5} daha</div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="absolute top-4 left-4 bg-white rounded-lg border border-slate-200 shadow-sm p-3 text-sm">
        <div className="space-y-1 text-slate-600">
          <p>
            <span className="font-medium">{markers.length}</span> kuruluş
          </p>
          {bounds && (
            <p>
              <span className="font-medium">
                {(Math.abs(bounds.north - bounds.south) * 111).toFixed(0)}
              </span>{' '}
              km
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
