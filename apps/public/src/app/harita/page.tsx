'use client';

import { useEffect, useRef, useState } from 'react';

export default function HaritaPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Fetch locations from API
        const response = await fetch('http://localhost:3001/api/v1/public/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }

        // In production, MapLibre GL would be loaded here
        // For now, showing a placeholder message
        if (mapContainer.current) {
          mapContainer.current.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f9f8f6;
              font-size: 18px;
              color: #666;
            ">
              <div style="text-align: center;">
                <h2 style="font-size: 24px; margin-bottom: 12px;">Harita Özelliği</h2>
                <p>MapLibre GL JS + PostGIS entegrasyonu geliştiriliyor...</p>
                <p style="font-size: 14px; color: #999;">
                  ${locations.length > 0 ? `${locations.length} konum yüklendi` : 'Konum veri yükleniyor...'}
                </p>
              </div>
            </div>
          `;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setLoading(false);
      }
    };

    initMap();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px', position: 'relative', zIndex: 10 }}>
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
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: 'calc(100vh - 70px)',
          backgroundColor: '#e5e5e5',
        }}
      />
    </div>
  );
}
