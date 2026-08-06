import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Umut-Sen Admin',
  description: 'Admin panel for Umut-Sen platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
