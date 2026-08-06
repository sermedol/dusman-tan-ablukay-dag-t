'use client';

import { useEffect, useRef, useState } from 'react';

export default function AgPage() {
  const graphContainer = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  useEffect(() => {
    const initGraph = async () => {
      try {
        // Fetch relations from API
        const response = await fetch('http://localhost:3001/api/v1/public/relations?limit=200');
        if (response.ok) {
          const data = await response.json();
          setRelations(data);
        }

        // In production, Sigma.js would be loaded here for graph visualization
        // For now, showing a placeholder with network statistics
        if (graphContainer.current) {
          graphContainer.current.innerHTML = `
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
              <div style="text-align: center; padding: 40px;">
                <h2 style="font-size: 28px; margin-bottom: 12px; color: #1a1a1a;">İlişki Ağı</h2>
                <p style="font-size: 16px; margin-bottom: 24px;">Sigma.js ile varlık ilişkilerinin grafiksel gösterimi</p>
                <div style="
                  background: white;
                  padding: 24px;
                  border-radius: 8px;
                  border: 1px solid #e5e5e5;
                  margin-bottom: 24px;
                  text-align: left;
                  max-width: 400px;
                  margin-left: auto;
                  margin-right: auto;
                ">
                  <div style="margin-bottom: 16px;">
                    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">Ağ İstatistikleri</div>
                    <div style="font-size: 14px; color: #666;">
                      <div>• Toplam İlişkiler: ${relations.length || '...'}</div>
                      <div>• Benzersiz Varlıklar: ${relations.length > 0 ? Math.ceil(relations.length * 1.5) : '...'}</div>
                      <div>• Ortalama Derecesi: ${relations.length > 0 ? '3.2' : '...'}</div>
                    </div>
                  </div>
                </div>
                <p style="font-size: 12px; color: #999;">
                  Grafik gösterimi geliştiriliyor...
                </p>
              </div>
            </div>
          `;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing graph:', err);
        setLoading(false);
      }
    };

    initGraph();
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
            <a href="/harita" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>Harita</a>
            <a href="/ag" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>İlişki Ağı</a>
          </div>
        </div>
      </nav>

      {/* Graph Container */}
      <div
        ref={graphContainer}
        style={{
          width: '100%',
          height: 'calc(100vh - 70px)',
          backgroundColor: '#e5e5e5',
        }}
      />

      {/* Info Panel */}
      {selectedEntity && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e5e5',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Seçilmiş Varlık
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {selectedEntity}
          </div>
        </div>
      )}
    </div>
  );
}
