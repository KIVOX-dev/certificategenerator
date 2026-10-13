'use client';
import Link from 'next/link';
import { useState } from 'react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#works', label: 'Our Works' },
  { href: '#involved', label: 'Get Involved' },
  { href: '#register', label: 'Event Registration' },
  { href: '#certificates', label: 'Certificates' },
  { href: '#faq', label: 'FAQ' },
];

/** Landing-page menu: inline links on desktop, a toggle button on phones. */
export function LandingNav() {
  const [open, setOpen] = useState(false);
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
      </button>
      <nav id="cbe-links" aria-label="Page sections" className={open ? 'open' : ''}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
        ))}
        <Link className="cbe-btn small" href="/get-certificate" onClick={close}>Get Certificate</Link>
        <a className="cbe-btn small ghost" href="#register" onClick={close}>Join</a>
      </nav>
    </div>
  );
}
