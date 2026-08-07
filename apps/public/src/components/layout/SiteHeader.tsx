'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Container from '../ui/Container';
import { NAV_LINKS } from './nav-links';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleQuickSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('q') as HTMLInputElement;
    if (input?.value.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.value.trim())}`);
      input.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-[13px] font-semibold text-white"
          >
            DT
          </span>
          <span className="text-body font-semibold tracking-tight text-ink">
            Düşmanı Tanı<span className="hidden text-ink-muted sm:inline">, Ablukayı Dağıt</span>
          </span>
        </Link>

        <nav aria-label="Ana gezinme" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-body-sm font-medium transition-colors duration-base ease-standard ${
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <form onSubmit={handleQuickSearch} className="relative">
            <input
              name="q"
              type="search"
              placeholder="Ara..."
              aria-label="Platformda ara"
              className="h-9 w-56 rounded-md border border-border bg-surface pl-3 pr-8 text-body-sm placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border-strong px-1.5 py-0.5 text-tiny text-ink-faint">
              /
            </kbd>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink md:hidden"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobil gezinme"
          className="animate-fade-in border-t border-border bg-paper px-5 py-4 md:hidden"
        >
          <form onSubmit={handleQuickSearch} className="relative mb-4">
            <input
              name="q"
              type="search"
              placeholder="Ara..."
              aria-label="Platformda ara"
              className="h-11 w-full rounded-md border border-border bg-surface px-4 text-body placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
          </form>
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-md px-3 py-3 text-body font-medium ${
                      active ? 'bg-surface-sunken text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
