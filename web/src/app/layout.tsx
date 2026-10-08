import type { Metadata, Viewport } from 'next';
import './globals.css';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('getCertificate'), robots: { index: false, follow: false } };
// No maximum-scale: people must be able to pinch-zoom.
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0a0f1a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="brand">
          <span className="tagline" lang="ta">{t('tagline')}</span>
        </header>
        <main>
          <div className="page-card">{children}</div>
        </main>
        <footer>
          <span lang="ta">{t('tagline')}</span>
        </footer>
      </body>
    </html>
  );
}
