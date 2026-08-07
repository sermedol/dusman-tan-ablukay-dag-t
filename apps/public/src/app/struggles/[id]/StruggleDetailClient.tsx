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
import { findDemoStruggle } from '../../../lib/demo-data';
import { getStruggleType, STATUS_LABELS, VERIFICATION_LABELS } from '../../../lib/struggle-taxonomy';

interface StruggleDetail {
  id: string;
  title: string;
  slug: string;
  description?: string;
  summary?: string;
  type: string;
  status: string;
  visibility: string;
  verificationStatus: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  participants?: string;
  outcome?: string;
  lessons?: string;
  tags: { tag: string }[];
  sourceEvidence: Array<{
    id: string;
    excerpt?: string;
    pageNumber?: number;
    notes?: string;
    source?: { id: string; title: string; type: string; url?: string };
  }>;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { name: string };
  updatedByUser?: { name: string };
}

export default function StruggleDetailClient({ id }: { id: string }) {
  const [struggle, setStruggle] = useState<StruggleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      const demo = findDemoStruggle(id);
      setStruggle({
        ...demo,
        visibility: 'public',
        verificationStatus: 'unverified',
        sourceEvidence: [],
        createdAt: demo.startDate ?? new Date().toISOString(),
        updatedAt: demo.startDate ?? new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const fetchStruggle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/struggles/${id}`);
        if (!response.ok) {
          setError(response.status === 404 ? 'Mücadele kaydı bulunamadı' : 'Mücadele yüklenirken hata oluştu');
          return;
        }
        const data = await response.json();
        setStruggle(data);
      } catch (err) {
        console.error('Error fetching struggle:', err);
        setError('Mücadele yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStruggle();
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

  if (error || !struggle) {
    return (
      <PageShell>
        <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="text-h2 text-ink">{error}</h1>
          <Button href="/struggles" className="mt-6">
            Mücadelelere Dön
          </Button>
        </Container>
      </PageShell>
    );
  }

  const typeInfo = getStruggleType(struggle.type);
  const statusInfo = STATUS_LABELS[struggle.status] ?? STATUS_LABELS.active;
  const verificationInfo = VERIFICATION_LABELS[struggle.verificationStatus] ?? VERIFICATION_LABELS.unverified;
  const startDate = struggle.startDate ? new Date(struggle.startDate).toLocaleDateString('tr-TR') : null;
  const endDate = struggle.endDate ? new Date(struggle.endDate).toLocaleDateString('tr-TR') : null;

  return (
    <PageShell>
      <div className="border-b border-border bg-surface py-10">
        <Container className="max-w-prose">
          <Link href="/struggles" className="text-body-sm font-medium text-ink-muted hover:text-ink">
            ← Mücadeleler
          </Link>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={typeInfo.tone}>{typeInfo.label}</Badge>
            <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
            <Badge tone={verificationInfo.tone}>{verificationInfo.label}</Badge>
          </div>

          <h1 className="mt-4 text-h1 font-serif text-ink">{struggle.title}</h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-body-sm text-ink-muted">
            {struggle.location && <span>{struggle.location}</span>}
            {startDate && (
              <span>
                {startDate}
                {endDate && ` – ${endDate}`}
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container className="max-w-prose py-10">
        <div className="flex flex-col gap-8">
          {struggle.description && (
            <section>
              <h2 className="text-h3 text-ink">Açıklama</h2>
              <p className="mt-3 whitespace-pre-wrap text-body-lg leading-relaxed text-ink-soft">
                {struggle.description}
              </p>
            </section>
          )}

          {(struggle.participants || struggle.outcome) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {struggle.participants && (
                <Card>
                  <h3 className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
                    Katılımcılar
                  </h3>
                  <p className="mt-2 text-body-sm leading-relaxed text-ink">{struggle.participants}</p>
                </Card>
              )}
              {struggle.outcome && (
                <Card>
                  <h3 className="text-caption font-semibold uppercase tracking-wide text-ink-faint">Sonuç</h3>
                  <p className="mt-2 text-body-sm leading-relaxed text-ink">{struggle.outcome}</p>
                </Card>
              )}
            </div>
          )}

          {struggle.lessons && (
            <Card>
              <h3 className="text-caption font-semibold uppercase tracking-wide text-ink-faint">Dersleri</h3>
              <p className="mt-2 whitespace-pre-wrap text-body-sm leading-relaxed text-ink">{struggle.lessons}</p>
            </Card>
          )}

          {struggle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {struggle.tags.map((tag) => (
                <span
                  key={tag.tag}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-body-sm text-ink-muted"
                >
                  #{tag.tag}
                </span>
              ))}
            </div>
          )}

          {struggle.sourceEvidence && struggle.sourceEvidence.length > 0 && (
            <section>
              <h2 className="text-h3 text-ink">Kaynak Kanıtları ({struggle.sourceEvidence.length})</h2>
              <div className="mt-4 flex flex-col gap-4">
                {struggle.sourceEvidence.map((evidence) => (
                  <div key={evidence.id} className="border-l-2 border-accent pl-4">
                    {evidence.source && (
                      <>
                        <div className="text-caption uppercase tracking-wide text-ink-faint">Kaynak</div>
                        <div className="mt-0.5 text-body-sm font-semibold text-ink">{evidence.source.title}</div>
                      </>
                    )}
                    {evidence.excerpt && (
                      <blockquote className="mt-3 rounded-md bg-surface-sunken px-3 py-2 text-body-sm italic leading-relaxed text-ink-soft">
                        &ldquo;{evidence.excerpt}&rdquo;
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="rounded-md border border-border bg-surface px-5 py-4 text-caption text-ink-faint">
            <div>
              Oluşturulma: {new Date(struggle.createdAt).toLocaleString('tr-TR')}
              {struggle.createdByUser && ` (${struggle.createdByUser.name})`}
            </div>
            <div className="mt-1">
              Son Güncelleme: {new Date(struggle.updatedAt).toLocaleString('tr-TR')}
              {struggle.updatedByUser && ` (${struggle.updatedByUser.name})`}
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
