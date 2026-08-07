'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import HeroNetworkArt from '../components/HeroNetworkArt';
import PageShell from '../components/layout/PageShell';
import type { Location } from '../components/MapComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Container from '../components/ui/Container';
import SearchField from '../components/ui/SearchField';
import { API_BASE_URL, IS_PREVIEW_MODE } from '../lib/config';
import { DEMO_LOCATIONS, DEMO_RELATIONS, DEMO_STRUGGLES } from '../lib/demo-data';
import { CATEGORY_CARD_CLASSES, ENTITY_CATEGORIES } from '../lib/entity-categories';
import { getStruggleType } from '../lib/struggle-taxonomy';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-sunken" />,
});

const STATS = [
  { value: '1.247', label: 'Varlık Profili' },
  { value: '3.891', label: 'Doğrulanmış İlişki' },
  { value: '523', label: 'Mücadele Kaydı' },
  { value: '12K+', label: 'Kaynak Kanıtı' },
];

interface RelationPreview {
  id: string;
  sourceEntity?: { id: string; canonicalName: string };
  targetEntity?: { id: string; canonicalName: string };
  relationType?: { name: string };
}

interface StrugglePreview {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  type: string;
  location?: string;
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [relations, setRelations] = useState<RelationPreview[]>([]);
  const [struggles, setStruggles] = useState<StrugglePreview[]>([]);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      setLocations([...DEMO_LOCATIONS]);
      setRelations([...DEMO_RELATIONS]);
      setStruggles([...DEMO_STRUGGLES]);
      return;
    }

    fetch(`${API_BASE_URL}/public/locations`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ id: string; name: string; latitude?: number; longitude?: number; entities?: unknown[] }>) => {
        setLocations(
          data
            .filter((loc): loc is typeof loc & { latitude: number; longitude: number } =>
              typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
            )
            .map((loc) => ({
              id: loc.id,
              name: loc.name,
              latitude: loc.latitude,
              longitude: loc.longitude,
              entityCount: loc.entities?.length ?? 0,
            }))
        );
      })
      .catch((err) => console.error('Error fetching locations:', err));

    fetch(`${API_BASE_URL}/public/relations?limit=4`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setRelations)
      .catch((err) => console.error('Error fetching relations:', err));

    fetch(`${API_BASE_URL}/public/struggles?limit=3`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: StrugglePreview[]) => setStruggles(data.slice(0, 3)))
      .catch((err) => console.error('Error fetching struggles:', err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid grid-cols-1 items-center gap-10 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-caption font-semibold text-ink-muted">
              Kaynağa dayalı araştırma platformu
            </span>

            <h1 className="mt-6 text-display font-serif leading-[1.05] text-ink sm:text-display-lg">
              Düşmanı Tanı, <span className="text-accent">Ablukayı Dağıt.</span>
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/harita" size="lg" className="bg-accent hover:bg-accent-strong">
                Haritayı Keşfet
              </Button>
              <Button href="/ag" variant="secondary" size="lg">
                Nasıl Çalışır?
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <HeroNetworkArt />
          </div>
        </Container>

        {/* Floating search module */}
        <Container className="relative z-10 -mt-4 sm:-mt-8">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-lg sm:p-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchField
                  size="lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Şirket, holding, kişi, kurum, ihale, proje, direniş…"
                  aria-label="Platformda ara"
                />
              </div>
              <Button type="submit" size="lg" className="bg-ink hover:bg-accent-strong sm:shrink-0">
                Ara
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/entities"
                className="rounded-full border border-ink bg-ink px-3.5 py-1.5 text-body-sm font-medium text-white"
              >
                Tümü
              </Link>
              {ENTITY_CATEGORIES.map((cat) => (
                <Link
                  key={cat.code}
                  href={`/entities?type=${encodeURIComponent(cat.typeName)}`}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-body-sm font-medium text-ink-soft transition-colors duration-base ease-standard hover:border-border-strong"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Bir Bakışta - flat, divider-based, no boxes */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col divide-y divide-border border-y border-border sm:flex-row sm:divide-x sm:divide-y-0">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex-1 px-2 py-6 text-center sm:py-8">
                <div className="text-display font-serif text-ink">{stat.value}</div>
                <div className="mt-1 text-body-sm text-ink-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Haritada Neler Var - dominant map moment */}
      <section className="py-4 sm:py-8">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
            <div>
              <h2 className="text-h1 font-serif text-ink">Haritada Neler Var?</h2>
              <p className="mt-4 text-body leading-relaxed text-ink-muted">
                Türkiye&rsquo;nin dört bir yanındaki sermaye örgütlenmelerini, kamu ilişkilerini,
                madenleri, santralleri, limanları ve direniş noktalarını keşfedin.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                {[
                  { label: 'Holdingler & Şirketler', tone: 'bg-accent' },
                  { label: 'Kamu Kurumları', tone: 'bg-success' },
                  { label: 'Direniş Noktaları', tone: 'bg-warning' },
                  { label: 'Ekoloji Mücadeleleri', tone: 'bg-[#316647]' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2.5 text-body-sm text-ink-soft">
                    <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${row.tone}`} />
                    {row.label}
                  </div>
                ))}
              </div>
              <Button href="/harita" variant="secondary" className="mt-8">
                Haritaya Git
              </Button>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-xl border border-border shadow-md sm:h-[520px]">
              {locations.length > 0 ? (
                <MapComponent locations={locations} />
              ) : (
                <div className="h-full w-full animate-pulse bg-surface-sunken" />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Keşfet - category cards, duotone, no fake photography */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-h1 font-serif text-ink">Keşfet</h2>
              <p className="mt-2 text-body text-ink-muted">Veri kategorilerimiz arasında gezinin, bağlantıları ortaya çıkarın.</p>
            </div>
            <Link href="/entities" className="hidden shrink-0 text-body-sm font-medium text-accent-strong sm:block">
              Tüm Kategoriler →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ENTITY_CATEGORIES.map((cat) => (
              <Link
                key={cat.code}
                href={`/entities?type=${encodeURIComponent(cat.typeName)}`}
                className={`group flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg p-5 transition-transform duration-base ease-standard hover:-translate-y-1 ${CATEGORY_CARD_CLASSES[cat.tone]}`}
              >
                <span className="text-h3 font-serif text-ink transition-transform duration-slow ease-standard group-hover:-translate-y-1">
                  {cat.label}
                </span>
                <span className="mt-1.5 text-body-sm leading-snug text-ink-soft">{cat.description}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Son Eklenen Bağlantılar */}
      <section className="border-t border-border py-20 sm:py-28">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div>
            <h2 className="text-h1 font-serif text-ink">Son Eklenen Bağlantılar</h2>
            <p className="mt-4 text-body leading-relaxed text-ink-muted">
              Platformun temel değeri burada: varlıklar arasındaki sahiplik, ortaklık, ihale ve
              destek ilişkilerini kaynağıyla birlikte görün.
            </p>
            <Button href="/relations" variant="secondary" className="mt-6">
              Tüm İlişkiler
            </Button>
          </div>

          <div className="flex flex-col divide-y divide-border border-t border-border">
            {relations.map((rel) =>
              rel.sourceEntity && rel.targetEntity ? (
                <div key={rel.id} className="flex flex-wrap items-center gap-3 py-5 text-body">
                  <Link href={`/entity/${rel.sourceEntity.id}`} className="font-semibold text-ink hover:text-accent-strong">
                    {rel.sourceEntity.canonicalName}
                  </Link>
                  <span className="flex items-center gap-2 text-body-sm text-ink-faint">
                    <span className="h-px w-6 bg-border-strong" aria-hidden="true" />
                    {rel.relationType?.name ?? 'İlişki'}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6h7M6 2.5 9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <Link href={`/entity/${rel.targetEntity.id}`} className="font-semibold text-ink hover:text-accent-strong">
                    {rel.targetEntity.canonicalName}
                  </Link>
                </div>
              ) : null
            )}
          </div>
        </Container>
      </section>

      {/* Güncel Mücadeleler */}
      <section className="border-t border-border bg-surface py-20 sm:py-28">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-h1 font-serif text-ink">Güncel Mücadeleler</h2>
              <p className="mt-2 text-body text-ink-muted">İşçi direnişi, sendikal baskı ve ekoloji mücadelelerinden son kayıtlar.</p>
            </div>
            <Link href="/struggles" className="hidden shrink-0 text-body-sm font-medium text-accent-strong sm:block">
              Tüm Mücadeleler →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {struggles.map((struggle) => {
              const typeInfo = getStruggleType(struggle.type);
              return (
                <Card key={struggle.id} href={`/struggles/${struggle.slug}`} padding="lg" className="flex flex-col gap-3">
                  <Badge tone={typeInfo.tone} className="w-fit">
                    {typeInfo.label}
                  </Badge>
                  <h3 className="text-h4 text-ink">{struggle.title}</h3>
                  <p className="line-clamp-2 text-body-sm leading-relaxed text-ink-muted">
                    {struggle.summary ?? struggle.description}
                  </p>
                  {struggle.location && <span className="mt-auto text-caption text-ink-faint">{struggle.location}</span>}
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA - the one deliberate dark, cinematic moment */}
      <section className="relative overflow-hidden bg-ink py-20 text-center sm:py-28">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <pattern id="ctaGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#faf8f4" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#ctaGrid)" />
        </svg>
        <Container className="relative">
          <h2 className="mx-auto max-w-2xl text-h1 font-serif text-white sm:text-display">
            Her bağlantının bir kaynağı var.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-white/70">
            Platformdaki her ilişki, Resmî Gazete&rsquo;den ticaret siciline, mahkeme kararından
            habere kadar izlenebilir bir kaynağa dayanır. İlişkileri kaynağıyla birlikte inceleyin.
          </p>
          <Button href="/relations" size="lg" className="mt-8 bg-accent hover:bg-accent-strong">
            Kaynaklı İlişkileri İncele
          </Button>
        </Container>
      </section>
    </PageShell>
  );
}
