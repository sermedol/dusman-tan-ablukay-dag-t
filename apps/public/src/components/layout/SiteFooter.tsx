import Link from 'next/link';

import Container from '../ui/Container';
import { NAV_LINKS } from './nav-links';

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-[11px] font-semibold text-white"
            >
              DT
            </span>
            <span className="text-body font-semibold text-ink">Düşmanı Tanı, Ablukayı Dağıt</span>
          </div>
          <p className="mt-3 text-body-sm leading-relaxed text-ink-muted">
            Türkiye&rsquo;de sermayenin gerçek yapısını, gücün nasıl örgütlendiğini ve direniş
            alanlarının nereye kadar uzandığını gösteren, kaynağa dayalı bir araştırma platformu.
          </p>
        </div>

        <nav aria-label="Alt bilgi gezinmesi" className="grid grid-cols-2 gap-x-12 gap-y-2 sm:flex sm:gap-10">
          <div className="flex flex-col gap-2">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
              Keşfet
            </span>
            {NAV_LINKS.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="text-body-sm text-ink-muted hover:text-ink">
                {link.label}
              </Link>
            ))}
            <Link href="/relations" className="text-body-sm text-ink-muted hover:text-ink">
              İlişkiler
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
              Platform
            </span>
            <a href="#" className="text-body-sm text-ink-muted hover:text-ink">
              Metodoloji
            </a>
            <a href="#" className="text-body-sm text-ink-muted hover:text-ink">
              Kaynak Göster
            </a>
            <a href="#" className="text-body-sm text-ink-muted hover:text-ink">
              İletişim
            </a>
          </div>
        </nav>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-border py-6 text-caption text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <span>Düşmanı Tanı Ablukayı Dağıt © {new Date().getFullYear()}. Halkın bilgilendirilmesi için.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-ink-muted">
            Gizlilik
          </a>
          <a href="#" className="hover:text-ink-muted">
            Kullanım Şartları
          </a>
        </div>
      </Container>
    </footer>
  );
}
