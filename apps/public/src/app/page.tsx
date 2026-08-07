'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import PageShell from '../components/layout/PageShell';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Container from '../components/ui/Container';
import SearchField from '../components/ui/SearchField';

const ENTRY_POINTS = [
  {
    href: '/harita',
    title: 'Haritada Keşfet',
    description: 'Tesisleri, maden sahalarını ve direniş noktalarını coğrafi olarak incele.',
    icon: (
      <path
        d="M9 3.5v13M15 6.5v13M4 5l5-1.5 6 2 5-1.5v13l-5 1.5-6-2-5 1.5V5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: '/ag',
    title: 'İlişki Ağını İncele',
    description: 'Sermaye grupları arasındaki sahiplik ve ortaklık bağlarını görselleştir.',
    icon: (
      <>
        <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="16" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="11" cy="15" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7.7 7.4L9.6 13M14.3 6.4L12.4 13" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
  },
  {
    href: '/struggles',
    title: 'Mücadeleleri Gör',
    description: 'İşçi direnişleri, sendikal örgütlenme ve ekoloji mücadelelerinin arşivi.',
    icon: (
      <path
        d="M10 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4L5.5 17l.9-5-3.6-3.6 5-.7L10 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
];

const STATS = [
  { value: '1.247', label: 'Varlık Profili' },
  { value: '3.891', label: 'Doğrulanmış İlişki' },
  { value: '523', label: 'Mücadele Kaydı' },
  { value: '12K+', label: 'Kaynak Kanıtı' },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, rgba(154, 47, 38, 0.07) 0%, rgba(154, 47, 38, 0) 70%)',
          }}
        />
        <Container className="relative flex flex-col items-center py-20 text-center sm:py-28">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-caption font-semibold text-ink-muted">
            Kaynağa dayalı araştırma platformu
          </span>

          <h1 className="max-w-3xl text-h1 font-serif text-ink sm:text-display sm:leading-[1.1] lg:text-display-lg">
            Düşmanı Tanı, Ablukayı Dağıt
          </h1>

          <p className="mt-6 max-w-xl text-body-lg leading-relaxed text-ink-muted">
            Türkiye&rsquo;de sermayenin gerçek yapısını, gücün nasıl örgütlendiğini ve direniş
            alanlarının nereye kadar uzandığını gösterir.
          </p>

          <form onSubmit={handleSearch} className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <SearchField
              size="lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bir varlık, kişi veya ilişki ara…"
              aria-label="Platformda ara"
            />
            <Button type="submit" size="lg" className="shrink-0 bg-accent hover:bg-accent-strong">
              Ara
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body-sm text-ink-muted">
            <span>Örnek aramalar:</span>
            <button
              type="button"
              onClick={() => router.push('/entities')}
              className="underline decoration-border-strong underline-offset-4 hover:text-ink hover:decoration-ink-muted"
            >
              holding yapıları
            </button>
            <button
              type="button"
              onClick={() => router.push('/struggles')}
              className="underline decoration-border-strong underline-offset-4 hover:text-ink hover:decoration-ink-muted"
            >
              madencilik karşıtı direniş
            </button>
          </div>
        </Container>
      </section>

      {/* Entry points */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-h2 font-serif text-ink">Keşfetmeye başla</h2>
              <p className="mt-2 text-body text-ink-muted">Üç farklı bakış açısıyla aynı veriye erişin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {ENTRY_POINTS.map((item) => (
              <Card
                key={item.href}
                href={item.href}
                padding="lg"
                className="group flex flex-col gap-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-soft text-accent-strong transition-transform duration-base ease-standard group-hover:scale-105">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    {item.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="text-h3 text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-body-sm leading-relaxed text-ink-muted">{item.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-body-sm font-medium text-accent-strong">
                  İncele
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-base ease-standard group-hover:translate-x-0.5">
                    <path d="M3 7h8M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-h2 font-serif text-ink">Platform genel bakış</h2>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-display font-serif text-accent-strong">{stat.value}</div>
                <div className="mt-1 text-body-sm text-ink-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
