'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import PageShell from '../../components/layout/PageShell';
import Badge from '../../components/ui/Badge';
import Container from '../../components/ui/Container';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_RELATIONS } from '../../lib/demo-data';

interface Relation {
  id: string;
  sourceEntity?: { id: string; canonicalName: string };
  targetEntity?: { id: string; canonicalName: string };
  relationType?: { name: string };
  description?: string;
  createdAt: string;
}

export default function RelationsPage() {
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      setRelations([...DEMO_RELATIONS]);
      setLoading(false);
      return;
    }

    const fetchRelations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/relations?limit=100`);
        if (!response.ok) throw new Error('Failed to fetch relations');
        const data = await response.json();
        setRelations(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, []);

  return (
    <PageShell>
      <div className="border-b border-border bg-surface py-10">
        <Container>
          <h1 className="text-h1 font-serif text-ink">İlişkiler</h1>
          <p className="mt-2 max-w-xl text-body text-ink-muted">
            Kayıtlı tüm varlık ilişkilerinin ham listesi. Görsel bir keşif için{' '}
            <Link href="/ag" className="font-medium text-accent-strong underline underline-offset-2">
              ilişki ağına
            </Link>{' '}
            göz atın.
          </p>
        </Container>
      </div>

      <Container className="py-10">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : relations.length === 0 ? (
          <EmptyState title="İlişki bulunamadı" />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-sunken text-caption uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3 text-left font-semibold">Kaynak Varlık</th>
                    <th className="px-5 py-3 text-left font-semibold">İlişki Tipi</th>
                    <th className="px-5 py-3 text-left font-semibold">Hedef Varlık</th>
                  </tr>
                </thead>
                <tbody>
                  {relations.map((relation) => (
                    <tr
                      key={relation.id}
                      className="border-b border-border bg-surface last:border-0 hover:bg-surface-sunken"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/entity/${relation.sourceEntity?.id}`}
                          className="font-medium text-ink hover:text-accent-strong"
                        >
                          {relation.sourceEntity?.canonicalName || '—'}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone="neutral">{relation.relationType?.name || 'İlişki'}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/entity/${relation.targetEntity?.id}`}
                          className="font-medium text-ink hover:text-accent-strong"
                        >
                          {relation.targetEntity?.canonicalName || '—'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>
    </PageShell>
  );
}
