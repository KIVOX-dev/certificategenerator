'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { links as site } from '@/lib/site';

const links = [
  { href: '/vision-mission', label: 'Vision & Mission' },
  { href: '/works', label: 'Our Works' },
  { href: '/register', label: 'Event Registration' },
  { href: '/get-certificate', label: 'Certificates' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/faq', label: 'FAQ' },
];

/** Site menu: each item opens its own page. Inline links on desktop, a toggle button on phones. */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  return (
    <div className="cbe-menu">
      <button
        type="button"
        className="cbe-burger"
        aria-expanded={open}
        aria-controls="cbe-links"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        <span className="cbe-burger-label">Menu</span>
      </button>
      <nav id="cbe-links" aria-label="Main menu" className={open ? 'open' : ''}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} aria-current={pathname === l.href ? 'page' : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <a className="cbe-btn small cbe-join" href={site.join} target="_blank" rel="noopener noreferrer" onClick={close}>Join the Movement</a>
    </div>
  );
}
