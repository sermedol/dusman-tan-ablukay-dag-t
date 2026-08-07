import type { ReactNode } from 'react';

import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
