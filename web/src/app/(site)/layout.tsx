import Image from 'next/image';
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
          {/* Source is 3360x738; next/image serves a resized WebP/AVIF at the displayed size. */}
          <Image src="/logo.png" alt="We The Leaders" width={210} height={46} sizes="(max-width: 640px) 150px, 210px" priority />
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
