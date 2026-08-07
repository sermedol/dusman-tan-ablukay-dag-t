'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import SiteHeader from '../../components/layout/SiteHeader';
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

const GraphComponent = dynamic(() => import('../../components/GraphComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-sunken" />,
});

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
        const response = await fetch(`${API_BASE_URL}/public/relations?limit=200`);
        if (response.ok) {
          const data = await response.json();
          setRelations(data);

          const entities = new Set<string>();
          data.forEach((rel: Relation) => {
            entities.add(rel.sourceEntity.id);
            entities.add(rel.targetEntity.id);
          });

          setStats({ relations: data.length, entities: entities.size });
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
    <div className="flex h-screen flex-col">
      <SiteHeader />

      <div className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-surface-sunken">
            <p className="text-body-sm text-ink-muted">Ağ yükleniyor…</p>
          </div>
        ) : relations.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center bg-surface-sunken">
            <div className="rounded-lg border border-border bg-surface px-10 py-8 text-center shadow-sm">
              <h2 className="text-h3 text-ink">İlişki Verisi Yok</h2>
              <p className="mt-2 text-body-sm text-ink-muted">Gösterilecek ilişki bulunmamaktadır.</p>
            </div>
          </div>
        ) : (
          <GraphComponent relations={relations} onNodeSelect={setSelectedEntity} />
        )}

        <div className="absolute left-5 top-5 z-30 rounded-lg border border-border bg-surface/95 p-4 shadow-sm backdrop-blur">
          <div className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
            Ağ İstatistikleri
          </div>
          <div className="mt-3 grid grid-cols-2 gap-5">
            <div>
              <div className="text-h2 font-serif text-accent-strong">{stats.entities}</div>
              <div className="text-tiny uppercase tracking-wide text-ink-faint">Varlık</div>
            </div>
            <div>
              <div className="text-h2 font-serif text-accent-strong">{stats.relations}</div>
              <div className="text-tiny uppercase tracking-wide text-ink-faint">İlişki</div>
            </div>
          </div>
        </div>

        {selectedEntity && (
          <div className="absolute bottom-5 right-5 z-30 max-w-xs rounded-lg border border-border bg-surface p-4 shadow-lg animate-rise-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
                  Seçilmiş Varlık
                </div>
                <div className="mt-1 text-body-sm font-medium text-ink">{selectedEntity}</div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                aria-label="Kapat"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-faint hover:text-ink"
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
