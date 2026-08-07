'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import PageShell from '../../components/layout/PageShell';
import Card from '../../components/ui/Card';
import Container from '../../components/ui/Container';
import EmptyState from '../../components/ui/EmptyState';
import FilterChip from '../../components/ui/FilterChip';
import SearchField from '../../components/ui/SearchField';
import { CardGridSkeleton } from '../../components/ui/Skeleton';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_ENTITIES } from '../../lib/demo-data';
import { ENTITY_CATEGORIES } from '../../lib/entity-categories';

interface Entity {
  id: string;
  canonicalName: string;
  description?: string;
  entityType?: { name: string };
  createdAt: string;
}

export default function EntitiesPage() {
  return (
    <Suspense fallback={<PageShell><div className="min-h-[50vh]" /></PageShell>}>
      <EntitiesPageContent />
    </Suspense>
  );
}

function EntitiesPageContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') ?? '';
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState(typeParam);

  useEffect(() => {
    setType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      setEntities([...DEMO_ENTITIES]);
      setLoading(false);
      return;
    }

    const fetchEntities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/entities?limit=100`);
        if (!response.ok) throw new Error('Failed to fetch entities');
        const data = await response.json();
        setEntities(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  const filteredEntities = entities.filter((e) => {
    const matchesQuery = query ? e.canonicalName.toLowerCase().includes(query.toLowerCase()) : true;
    const matchesType = type ? e.entityType?.name.toLowerCase() === type.toLowerCase() : true;
    return matchesQuery && matchesType;
  });

  return (
    <PageShell>
      <div className="border-b border-border bg-surface py-10">
        <Container>
          <h1 className="text-h1 font-serif text-ink">Varlıklar</h1>
          <p className="mt-2 max-w-xl text-body text-ink-muted">
            Holding, şirket, sendika, banka ve kamu kurumu profillerinin tamamı.
          </p>
          <div className="mt-6 max-w-md">
            <SearchField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Varlık ara…"
              aria-label="Varlık ara"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <FilterChip active={!type} onClick={() => setType('')}>
              Tümü
            </FilterChip>
            {ENTITY_CATEGORIES.map((cat) => (
              <FilterChip key={cat.code} active={type === cat.typeName} onClick={() => setType(cat.typeName)}>
                {cat.label}
              </FilterChip>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <p className="mb-6 text-body-sm text-ink-muted">
          {loading ? 'Yükleniyor…' : `${filteredEntities.length} varlık`}
        </p>

        {loading ? (
          <CardGridSkeleton />
        ) : filteredEntities.length === 0 ? (
          <EmptyState
            title="Varlık bulunamadı"
            description="Arama kriterlerinize uygun bir varlık kaydı yok."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEntities.map((entity) => (
              <Card key={entity.id} href={`/entity/${entity.id}`} className="flex flex-col gap-2">
                <h3 className="text-h4 text-ink">{entity.canonicalName}</h3>
                {entity.entityType && (
                  <span className="text-caption font-medium uppercase tracking-wide text-ink-faint">
                    {entity.entityType.name}
                  </span>
                )}
                {entity.description && (
                  <p className="line-clamp-2 text-body-sm leading-relaxed text-ink-muted">
                    {entity.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
