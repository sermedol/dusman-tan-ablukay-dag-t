'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import PageShell from '../../../components/layout/PageShell';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Container from '../../../components/ui/Container';
import Skeleton from '../../../components/ui/Skeleton';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../../../lib/config';
import { findDemoEntity } from '../../../lib/demo-data';

interface EntityProfile {
  id: string;
  canonicalName: string;
  slug: string;
  description?: string;
  entityType?: { name: string };
  sourceEvidence?: Array<{
    id: string;
    source?: {
      id: string;
      title: string;
      url: string;
    };
  }>;
  outgoingRelations?: Array<{
    id: string;
    targetEntity: {
      id: string;
      canonicalName: string;
    };
    relationType?: { name: string };
  }>;
  incomingRelations?: Array<{
    id: string;
    sourceEntity: {
      id: string;
      canonicalName: string;
    };
    relationType?: { name: string };
  }>;
}

export default function EntityDetailClient({ id }: { id: string }) {
  const [entity, setEntity] = useState<EntityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      const demo = findDemoEntity(id);
      setEntity({ ...demo, outgoingRelations: [], incomingRelations: [], sourceEvidence: [] });
      setLoading(false);
      return;
    }

    const fetchEntity = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/entities/${id}`);
        if (!response.ok) throw new Error('Entity not found');
        const data = await response.json();
        setEntity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <Container className="py-16">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="mb-3 h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </Container>
      </PageShell>
    );
  }

  if (error || !entity) {
    return (
      <PageShell>
        <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="text-h2 text-ink">Bulunamadı</h1>
          <p className="mt-2 text-body text-ink-muted">{error || 'Bu varlık bulunamadı.'}</p>
          <Button href="/" className="mt-6">
            Anasayfaya Dön
          </Button>
        </Container>
      </PageShell>
    );
  }

  const relationCount = (entity.outgoingRelations?.length ?? 0) + (entity.incomingRelations?.length ?? 0);

  return (
    <PageShell>
      <div className="border-b border-border bg-surface">
        <Container className="py-10">
          <Link href="/entities" className="text-body-sm font-medium text-ink-muted hover:text-ink">
            ← Varlıklar
          </Link>

          <div className="mt-5 flex items-start gap-5">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-accent text-h2 font-serif text-white sm:h-20 sm:w-20"
            >
              {entity.canonicalName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-h1 font-serif text-ink">{entity.canonicalName}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {entity.entityType && <Badge tone="accent">{entity.entityType.name}</Badge>}
                <Badge tone="neutral">{relationCount} bağlantı</Badge>
              </div>
            </div>
          </div>

          {entity.description && (
            <p className="mt-6 max-w-prose text-body-lg leading-relaxed text-ink-soft">
              {entity.description}
            </p>
          )}
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          {/* Evidence first */}
          <section>
            <h2 className="text-h3 text-ink">
              Kaynak Kanıtları {entity.sourceEvidence?.length ? `(${entity.sourceEvidence.length})` : ''}
            </h2>
            {entity.sourceEvidence && entity.sourceEvidence.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {entity.sourceEvidence.map((evidence) => (
                  <a
                    key={evidence.id}
                    href={evidence.source?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md border border-border bg-surface p-4 transition-colors duration-base ease-standard hover:border-border-strong"
                  >
                    <div className="text-body-sm font-medium text-ink">{evidence.source?.title || 'Kaynak'}</div>
                    <div className="mt-1 truncate text-caption text-info">{evidence.source?.url}</div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-body-sm text-ink-muted">Bu varlık için henüz kaynak kanıtı eklenmedi.</p>
            )}
          </section>

          {/* Connections second */}
          <section>
            <h2 className="text-h3 text-ink">Bağlantılar {relationCount ? `(${relationCount})` : ''}</h2>
            {relationCount > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {!!entity.outgoingRelations?.length && (
                  <div>
                    <h3 className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
                      Bu varlıktan
                    </h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {entity.outgoingRelations.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/entity/${rel.targetEntity.id}`}
                          className="block rounded-md border border-border bg-surface p-3 transition-colors duration-base ease-standard hover:border-border-strong"
                        >
                          <div className="text-body-sm font-medium text-ink">{rel.targetEntity.canonicalName}</div>
                          {rel.relationType && (
                            <div className="mt-0.5 text-caption text-ink-faint">{rel.relationType.name}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {!!entity.incomingRelations?.length && (
                  <div>
                    <h3 className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
                      Bu varlığa
                    </h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {entity.incomingRelations.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/entity/${rel.sourceEntity.id}`}
                          className="block rounded-md border border-border bg-surface p-3 transition-colors duration-base ease-standard hover:border-border-strong"
                        >
                          <div className="text-body-sm font-medium text-ink">{rel.sourceEntity.canonicalName}</div>
                          {rel.relationType && (
                            <div className="mt-0.5 text-caption text-ink-faint">{rel.relationType.name}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-body-sm text-ink-muted">Bu varlık için henüz kayıtlı bir bağlantı yok.</p>
            )}
          </section>
        </div>

        {/* Metadata third */}
        <Card padding="lg" className="h-fit lg:sticky lg:top-24">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-ink-faint">Hakkında</h2>
          <dl className="mt-4 flex flex-col gap-3 text-body-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Tür</dt>
              <dd className="font-medium text-ink">{entity.entityType?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Bağlantı</dt>
              <dd className="font-medium text-ink">{relationCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Kanıt</dt>
              <dd className="font-medium text-ink">{entity.sourceEvidence?.length ?? 0}</dd>
            </div>
          </dl>
          <Button href={`/ag?entity=${entity.id}`} variant="secondary" size="sm" className="mt-5 w-full">
            İlişki ağında gör
          </Button>
        </Card>
      </Container>
    </PageShell>
  );
}
