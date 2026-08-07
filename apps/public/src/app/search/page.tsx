'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import PageShell from '../../components/layout/PageShell';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Container from '../../components/ui/Container';
import EmptyState from '../../components/ui/EmptyState';
import SearchField from '../../components/ui/SearchField';
import Skeleton from '../../components/ui/Skeleton';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_SEARCH_RESULTS } from '../../lib/demo-data';

interface SearchResult {
  id: string;
  type: 'entity' | 'relation' | 'source';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  entity: 'Varlık',
  relation: 'İlişki',
  source: 'Kaynak',
};

const TYPE_TONE: Record<SearchResult['type'], 'accent' | 'success' | 'warning'> = {
  entity: 'accent',
  relation: 'success',
  source: 'warning',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<PageShell><div className="min-h-[50vh]" /></PageShell>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(q);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    if (IS_PREVIEW_MODE) {
      const needle = q.toLocaleLowerCase('tr');
      setResults(DEMO_SEARCH_RESULTS.filter((r) => r.title.toLocaleLowerCase('tr').includes(needle)));
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <PageShell>
      <div className="border-b border-border bg-surface py-10">
        <Container>
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-3">
            <SearchField
              size="lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara…"
              aria-label="Platformda ara"
              autoFocus
            />
          </form>
        </Container>
      </div>

      <Container className="py-10">
        {loading ? (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !q ? (
          <EmptyState title="Aramaya başlayın" description="Bir varlık, ilişki ya da kaynak adı yazın." />
        ) : results.length === 0 ? (
          <EmptyState title={`"${q}" için sonuç bulunamadı`} description="Farklı bir anahtar kelime deneyin." />
        ) : (
          <div className="mx-auto max-w-2xl">
            <p className="mb-5 text-body-sm text-ink-muted">{results.length} sonuç bulundu</p>
            <div className="flex flex-col gap-3">
              {results.map((result) => (
                <Card key={result.id} padding="md" className="hover:shadow-sm">
                  <Link href={`/${result.type}/${result.id}`} className="block">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-h4 text-ink">{result.title}</h3>
                      <Badge tone={TYPE_TONE[result.type]}>{TYPE_LABEL[result.type]}</Badge>
                    </div>
                    {result.description && (
                      <p className="mt-1.5 text-body-sm leading-relaxed text-ink-muted">{result.description}</p>
                    )}
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </PageShell>
  );
}
