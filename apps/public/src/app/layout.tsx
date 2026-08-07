import type { Metadata, Viewport } from 'next';

import PreviewBanner from '../components/PreviewBanner';
import { IS_PREVIEW_MODE } from '../lib/config';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Düşmanı Tanı, Ablukayı Dağıt',
    template: '%s — Düşmanı Tanı, Ablukayı Dağıt',
  },
  description:
    "Türkiye'de sermayenin gerçek yapısını, gücün nasıl örgütlendiğini ve direniş alanlarının nereye kadar uzandığını gösteren araştırma platformu.",
  ...(IS_PREVIEW_MODE ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf8f4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-paper text-ink font-sans antialiased">
        <a href="#main-content" className="skip-link">
          İçeriğe geç
        </a>
        <PreviewBanner />
        {children}
      </body>
    </html>
  );
}
