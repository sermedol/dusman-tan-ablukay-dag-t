'use client';

import { useEffect, useState } from 'react';

import PageShell from '../../components/layout/PageShell';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Container from '../../components/ui/Container';
import EmptyState from '../../components/ui/EmptyState';
import FilterChip from '../../components/ui/FilterChip';
import SearchField from '../../components/ui/SearchField';
import { CardGridSkeleton } from '../../components/ui/Skeleton';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_STRUGGLES } from '../../lib/demo-data';
import { getStruggleType, STRUGGLE_TYPES } from '../../lib/struggle-taxonomy';

interface Struggle {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  participants?: string;
  outcome?: string;
  tags: { tag: string }[];
}

export default function StrugglesPage() {
  const [struggles, setStruggles] = useState<Struggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStruggles = async () => {
      if (IS_PREVIEW_MODE) {
        setStruggles([...DEMO_STRUGGLES]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/struggles`);
        if (response.ok) {
          const data = await response.json();
          setStruggles(data);
        }
      } catch (err) {
        console.error('Mücadeleler yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStruggles();
  }, []);

  const filteredStruggles = struggles.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || s.type === selectedType;
    return matchesSearch && matchesType;
  });

  const availableTypes = Object.entries(STRUGGLE_TYPES).filter(
    ([type]) => struggles.filter((s) => s.type === type).length > 0
  );

  return (
    <PageShell>
      <div className="border-b border-border bg-surface py-10">
        <Container>
          <h1 className="text-h1 font-serif text-ink">Direniş Haritası</h1>
          <p className="mt-2 max-w-xl text-body text-ink-muted">
            İşçi direniş, sendikal örgütlenme, ekoloji mücadelesi ve halk hareketlerinin kapsamlı arşivi.
          </p>
          <div className="mt-6 max-w-md">
            <SearchField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mücadele, konum, açıklama ara…"
              aria-label="Mücadele ara"
            />
          </div>
        </Container>
      </div>

      <div className="border-b border-border bg-surface py-4">
        <Container>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={!selectedType} onClick={() => setSelectedType('')}>
              Tümü ({struggles.length})
            </FilterChip>
            {availableTypes.map(([type, info]) => (
              <FilterChip key={type} active={selectedType === type} onClick={() => setSelectedType(type)}>
                {info.label} ({struggles.filter((s) => s.type === type).length})
              </FilterChip>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-10">
        {loading ? (
          <CardGridSkeleton />
        ) : filteredStruggles.length === 0 ? (
          <EmptyState
            title="Mücadele kaydı bulunamadı"
            description="Arama kriterlerinize uygun bir mücadele kaydı bulunamadı."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStruggles.map((struggle) => {
              const typeInfo = getStruggleType(struggle.type);
              const startDate = struggle.startDate
                ? new Date(struggle.startDate).toLocaleDateString('tr-TR')
                : '';
              const endDate = struggle.endDate ? new Date(struggle.endDate).toLocaleDateString('tr-TR') : '';

              return (
                <Card
                  key={struggle.id}
                  href={`/struggles/${struggle.slug}`}
                  className="flex flex-col gap-3"
                >
                  <Badge tone={typeInfo.tone} className="w-fit">
                    {typeInfo.label}
                  </Badge>
                  <h3 className="text-h4 text-ink">{struggle.title}</h3>
                  {struggle.description && (
                    <p className="line-clamp-2 text-body-sm leading-relaxed text-ink-muted">
                      {struggle.description}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col gap-1 pt-2 text-caption text-ink-faint">
                    {struggle.location && <span>{struggle.location}</span>}
                    {startDate && (
                      <span>
                        {startDate}
                        {endDate && ` – ${endDate}`}
                      </span>
                    )}
                  </div>
                  {struggle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {struggle.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.tag}
                          className="rounded-sm bg-surface-sunken px-2 py-0.5 text-tiny text-ink-muted"
                        >
                          #{tag.tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
