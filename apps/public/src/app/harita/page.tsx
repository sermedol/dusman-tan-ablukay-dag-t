'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import type { Location } from '../../components/MapComponent';

interface RawLocation {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  entities?: { entity: { id: string; canonicalName: string } }[];
}

const MapComponent = dynamic(
  () => import('../../components/MapComponent'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }} /> }
);

export default function HaritaPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/public/locations');
        if (response.ok) {
          const data: RawLocation[] = await response.json();
          // Filter locations with coordinates
          const validLocations: Location[] = data
            .filter((loc): loc is RawLocation & { latitude: number; longitude: number } =>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px', position: 'relative', zIndex: 20 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: '700', textDecoration: 'none', color: '#1a1a1a' }}>
            Umut-Sen
          </a>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>Anasayfa</a>
            <a href="/harita" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Harita</a>
            <a href="/ag" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>İlişki Ağı</a>
          </div>
        </div>
      </nav>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666' }}>Harita yükleniyor...</p>
          </div>
        ) : locations.length === 0 ? (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Konum Veri Yok</h2>
              <p style={{ color: '#666', margin: 0 }}>Haritada gösterilecek konum bulunmamaktadır.</p>
            </div>
          </div>
        ) : (
          <MapComponent locations={locations} onLocationSelect={setSelectedLocation} />
        )}

        {/* Info Panel */}
        {selectedLocation && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 30,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1a1a1a' }}>
                  {selectedLocation.name}
                </h3>
                {selectedLocation.entityCount && (
                  <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                    {selectedLocation.entityCount} varlık
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#999',
                }}
              >
                ✕
              </button>
            </div>
            <a
              href={`/?q=${encodeURIComponent(selectedLocation.name)}`}
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              Konumu Ara
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
