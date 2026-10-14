import Link from 'next/link';
import { LandingNav } from '@/components/LandingNav';
import { links } from '@/lib/site';
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
        <div className="cbe-foot-inner">
          <div className="cbe-foot-brand">
            <Link href="/" className="cbe-foot-logo" aria-label="We The Leaders home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-footer.png" alt="We The Leaders" width={210} height={46} loading="lazy" decoding="async" />
            </Link>
            <strong>We The Leaders · Coimbatore</strong>
            <span lang="ta">#அறம் செய விரும்பு</span>
            <p>Local action. Measurable change. One community action every month, measured and shared with everyone.</p>
            <a className="cbe-btn small" href={links.join} target="_blank" rel="noopener noreferrer">Join the Movement</a>
          </div>

          <nav aria-label="Explore" className="cbe-foot-col">
            <h4>Explore</h4>
            <Link href="/">Home</Link>
            <Link href="/vision-mission">Vision &amp; Mission</Link>
            <Link href="/works">Our Works</Link>
            <Link href="/get-involved">Get Involved</Link>
            <Link href="/#faq">FAQ</Link>
          </nav>

          <nav aria-label="Events and certificates" className="cbe-foot-col">
            <h4>Events</h4>
            <Link href="/register">Event Registration</Link>
            <Link href="/get-certificate">Get your certificate</Link>
            <Link href="/get-certificate">Verify a certificate</Link>
          </nav>

          <div className="cbe-foot-col">
            <h4>Connect</h4>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={links.site} target="_blank" rel="noopener noreferrer">wetheleader.org</a>
            <a href={links.appStore} target="_blank" rel="noopener noreferrer">App Store</a>
            <a href={links.playStore} target="_blank" rel="noopener noreferrer">Google Play</a>
          </div>
        </div>
        <div className="cbe-foot-bottom">
          <small>© {new Date().getFullYear()} We The Leaders. All rights reserved.</small>
          <small>Coimbatore constituency</small>
        </div>
      </footer>
    </div>
  );
}
