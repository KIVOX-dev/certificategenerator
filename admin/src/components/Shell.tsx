'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const links = [
  ['/', 'Dashboard'],
  ['/events', 'Events'],
  ['/certificates', 'Certificates'],
  ['/registrations', 'Registrations'],
  ['/templates', 'Templates'],
  ['/settings', 'Settings'],
];

/** Wraps every admin page: verifies the session, renders navigation. */
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (path === '/login') return;
    api('/auth/me').then((r) => setUser(r.user)).catch(() => router.replace('/login'));
  }, [path, router]);

  if (path === '/login') return <>{children}</>;
  if (!user) return <div className="content">Loading…</div>;
  return (
    <div className="shell">
      <nav className="side" aria-label="Admin">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo.png`} alt="We The Leaders - Lead The Change" className="side-logo" width={200} height={44} />
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={(href === '/' ? path === '/' : path.startsWith(href)) ? 'active' : ''}>{label}</Link>
        ))}
      </nav>
      <div className="content">{children}</div>
    </div>
  );
}
