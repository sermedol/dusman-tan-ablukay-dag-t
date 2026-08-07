import type { Metadata, Viewport } from 'next';

import PreviewBanner from '../components/PreviewBanner';
import { IS_PREVIEW_MODE } from '../lib/config';

export const metadata: Metadata = {
  title: 'Umut-Sen Platform | Turkish Capital Groups & Labor Relations',
  description: 'Research and mapping platform for analyzing Turkish capital groups, labor struggles, and connections.',
  ...(IS_PREVIEW_MODE ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <PreviewBanner />
        {children}
      </body>
    </html>
  );
}
