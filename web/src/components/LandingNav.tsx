'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { links as site } from '@/lib/site';

const links = [
  { href: '/vision-mission', label: 'Vision & Mission' },
  { href: '/works', label: 'Our Works' },
  { href: '/register', label: 'Event Registration' },
  { href: '/get-certificate', label: 'Certificates' },
  { href: '/get-involved', label: 'Get Involved' },
];

/** Site menu: each item opens its own page. Inline links on desktop, a toggle button on phones. */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const root = useRef<HTMLDivElement>(null);

  // Close the phone menu on Escape or a tap outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  return (
    <div className="cbe-menu" ref={root}>
      <button
        type="button"
        className="cbe-burger"
        aria-expanded={open}
        aria-controls="cbe-links"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      <nav id="cbe-links" aria-label="Main menu" className={open ? 'open' : ''}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} aria-current={pathname === l.href ? 'page' : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <a className="cbe-btn small cbe-join" href={site.join} target="_blank" rel="noopener noreferrer" onClick={close}><span className="cbe-join-long">Join the Movement</span><span className="cbe-join-short">Join</span></a>
    </div>
  );
}
