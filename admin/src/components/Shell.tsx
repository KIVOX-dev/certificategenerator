'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Icon } from './Icons';

const links = [
  ['/', 'Dashboard', 'dashboard'],
  ['/events', 'Events', 'events'],
  ['/certificates', 'Certificates', 'certificates'],
  ['/registrations', 'Registrations', 'registrations'],
  ['/templates', 'Templates', 'templates'],
  ['/settings', 'Settings', 'settings'],
] as const;

/** Wraps every admin page: verifies the session, renders the top bar and navigation. */
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (path === '/login') return;
    api('/auth/me').then((r) => setUser(r.user)).catch(() => router.replace('/login'));
  }, [path, router]);
  useEffect(() => setOpen(false), [path]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/login');
  }

  if (path === '/login') return <>{children}</>;
  if (!user) return <div className="content">Loading…</div>;
  return (
    <div className="shell">
      <header className="topbar noprint">
        <button type="button" className="icon-btn menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="side-nav" onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <Link href="/" className="topbar-brand" aria-label="We The Leaders - Dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo.svg`} alt="We The Leaders - Lead The Change" width={168} height={37} />
        </Link>
        <span className="topbar-title">Certificates Admin</span>
        <span className="topbar-spacer" />
        <span className="topbar-user" title={user.email}>{user.name || user.email}</span>
        <button type="button" className="icon-btn" onClick={logout} aria-label="Log out" title="Log out"><Icon name="logout" /></button>
      </header>
      <div className="body">
        <nav id="side-nav" className={`side${open ? ' open' : ''}`} aria-label="Admin">
          {links.map(([href, label, icon]) => {
            const active = href === '/' ? path === '/' : path.startsWith(href);
            return (
              <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
                <Icon name={icon} />{label}
              </Link>
            );
          })}
        </nav>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
