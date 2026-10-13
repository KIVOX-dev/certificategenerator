import Link from 'next/link';
import { LandingNav } from '@/components/LandingNav';
import './coimbatore.css';

/** Shared chrome for the public site: the landing page and every menu page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cbe">
      <div className="cbe-navbar">
      <header className="cbe-nav">
        <Link href="/" aria-label="We The Leaders home">
          {/* Pre-resized 480px copy (7 KB, vs 92 KB original): shown at 210px, so sharp on 2x phones. Plain <img> on purpose: no image-optimiser dependency. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.png" alt="We The Leaders" width={210} height={46} fetchPriority="high" decoding="async" />
        </Link>
        <LandingNav />
      </header>
      </div>

      {children}

      <footer className="cbe-footer">
        <div className="cbe-foot-brand">
          <strong>We The Leaders · Coimbatore</strong>
          <span lang="ta">#அறம் செய விரும்பு</span>
        </div>
        <nav aria-label="Footer" className="cbe-foot-links">
          <Link href="/">Home</Link>
          <Link href="/vision-mission">Vision & Mission</Link>
          <Link href="/works">Our Works</Link>
          <Link href="/register">Event Registration</Link>
          <Link href="/get-certificate">Certificates</Link>
          <Link href="/get-involved">Get Involved</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <small>© We The Leaders. All rights reserved.</small>
      </footer>
    </div>
  );
}
