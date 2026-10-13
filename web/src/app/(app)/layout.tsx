import { t } from '@/lib/i18n';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="We The Leaders - Lead The Change" width={224} height={49} className="brand-logo" />
      </header>
      <main>
        <div className="page-card">{children}</div>
      </main>
      <footer>
        <span lang="ta">{t('tagline')}</span>
      </footer>
    </>
  );
}
