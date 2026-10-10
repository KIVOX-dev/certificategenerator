import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: t('getCertificate'),
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: t('homeTitle'), statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};
// No maximum-scale: people must be able to pinch-zoom.
// viewportFit 'cover' + env(safe-area-inset-*) in the CSS lets the page use the full screen around notches;
// 'resizes-content' shrinks the layout (not just the visual viewport) when the keyboard opens.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#0a0f1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
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
