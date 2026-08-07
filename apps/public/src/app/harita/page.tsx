'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import SiteHeader from '../../components/layout/SiteHeader';
import type { Location } from '../../components/MapComponent';
import Button from '../../components/ui/Button';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_LOCATIONS } from '../../lib/demo-data';

interface RawLocation {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  entities?: { entity: { id: string; canonicalName: string } }[];
}

const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-sunken" />,
});

export default function HaritaPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      setLocations([...DEMO_LOCATIONS]);
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/locations`);
        if (response.ok) {
          const data: RawLocation[] = await response.json();
          const validLocations: Location[] = data
            .filter(
              (loc): loc is RawLocation & { latitude: number; longitude: number } =>
                typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
            )
            .map((loc) => ({
              id: loc.id,
              name: loc.name,
              latitude: loc.latitude,
              longitude: loc.longitude,
              entityCount: loc.entities?.length || 0,
            }));
          setLocations(validLocations);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />

      <div className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-surface-sunken">
            <p className="text-body-sm text-ink-muted">Harita yükleniyor…</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center bg-surface-sunken">
            <div className="rounded-lg border border-border bg-surface px-10 py-8 text-center shadow-sm">
              <h2 className="text-h3 text-ink">Konum Verisi Yok</h2>
              <p className="mt-2 text-body-sm text-ink-muted">Haritada gösterilecek konum bulunmamaktadır.</p>
            </div>
          </div>
        ) : (
          <MapComponent locations={locations} onLocationSelect={setSelectedLocation} />
        )}

        {selectedLocation && (
          <div className="absolute bottom-5 right-5 z-30 w-full max-w-xs rounded-lg border border-border bg-surface p-5 shadow-lg animate-rise-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-h4 text-ink">{selectedLocation.name}</h3>
                {!!selectedLocation.entityCount && (
                  <p className="mt-0.5 text-caption text-ink-faint">{selectedLocation.entityCount} varlık</p>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                aria-label="Kapat"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-faint hover:text-ink"
              >
                ✕
              </button>
            </div>
            <Button
              href={`/?q=${encodeURIComponent(selectedLocation.name)}`}
              size="sm"
              className="mt-4 w-full bg-accent hover:bg-accent-strong"
            >
              Konumu Ara
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
