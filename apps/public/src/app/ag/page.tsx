'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_RELATIONS } from '../../lib/demo-data';

interface Entity {
  id: string;
  canonicalName: string;
}

interface Relation {
  id: string;
  sourceEntity: Entity;
  targetEntity: Entity;
  relationType?: { name: string };
}

const GraphComponent = dynamic(
  () => import('../../components/GraphComponent'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }} /> }
);

export default function AgPage() {
  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [stats, setStats] = useState({ relations: 0, entities: 0 });

  useEffect(() => {
    const initGraph = async () => {
      if (IS_PREVIEW_MODE) {
        const data = [...DEMO_RELATIONS] as unknown as Relation[];
        setRelations(data);
        const entities = new Set<string>();
        data.forEach((rel) => {
          entities.add(rel.sourceEntity.id);
          entities.add(rel.targetEntity.id);
        });
        setStats({ relations: data.length, entities: entities.size });
        setLoading(false);
        return;
      }

      try {
        // Fetch relations from API
        const response = await fetch(`${API_BASE_URL}/public/relations?limit=200`);
        if (response.ok) {
          const data = await response.json();
          setRelations(data);

          // Calculate statistics
          const entities = new Set<string>();
          data.forEach((rel: Relation) => {
            entities.add(rel.sourceEntity.id);
            entities.add(rel.targetEntity.id);
          });

          setStats({
            relations: data.length,
            entities: entities.size,
          });
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px', position: 'relative', zIndex: 20 }}>
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
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666' }}>Ağ yükleniyor...</p>
          </div>
        ) : relations.length === 0 ? (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>İlişki Veri Yok</h2>
              <p style={{ color: '#666', margin: 0 }}>Gösterilecek ilişki bulunmamaktadır.</p>
            </div>
          </div>
        ) : (
          <GraphComponent relations={relations} onNodeSelect={setSelectedEntity} />
        )}

        {/* Stats Panel */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e5e5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 30,
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
            Ağ İstatistikleri
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                {stats.entities}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>Varlık</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                {stats.relations}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>İlişki</div>
            </div>
          </div>
        </div>

        {/* Selected Entity Panel */}
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
            zIndex: 30,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  Seçilmiş Varlık
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {selectedEntity}
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#999',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
