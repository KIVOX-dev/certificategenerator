'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface SiteSettings {
  siteUrl: string;
  source: 'database' | 'environment';
  environmentSiteUrl: string;
  count: number; // certificates whose QR points somewhere else
  running: boolean;
}

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const load = useCallback(async () => {
    const s: SiteSettings = await api('/settings');
    setSite(s);
    return s;
  }, []);

  useEffect(() => {
    api('/auth/me').then((r) => setUser(r.user)).catch(() => undefined);
    load().then((s) => setInput(s.siteUrl)).catch(() => undefined);
    return () => clearInterval(timer.current);
  }, [load]);

  const looksLocal = (u: string) => /localhost|127\.0\.0\.1/.test(u);
  const here = typeof window !== 'undefined' ? window.location.origin : '';

  async function save(url: string) {
    setBusy(true);
    setMsg(null);
    try {
      const s: SiteSettings = await api('/settings/site-url', { method: 'PUT', json: { siteUrl: url } });
      setSite(s);
      setInput(s.siteUrl);
      setMsg({ kind: 'ok', text: `Saved. QR codes and links now use ${s.siteUrl}` });
    } catch (e: any) {
      setMsg({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function fix() {
    setBusy(true);
    setMsg(null);
    try {
      let s: SiteSettings = await api('/settings/fix-certificate-urls', { method: 'POST' });
      setSite(s);
      setMsg({ kind: 'ok', text: 'Updating certificates in the background…' });
      clearInterval(timer.current);
      timer.current = setInterval(async () => {
        s = await load();
        if (s.count === 0 && !s.running) {
          clearInterval(timer.current);
          setMsg({ kind: 'ok', text: 'All certificates now point to the current site address.' });
        }
      }, 3000);
    } catch (e: any) {
      setMsg({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  return (
    <>
      <h1>Settings</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Public site address</h2>
        <p>
          Every QR code and link is built from this address: the event registration QR and the verification QR printed on each
          certificate. It must be the public https address of your participant website.
        </p>
        {site && (
          <p>
            In use now: <b>{site.siteUrl}</b>{' '}
            <span className="badge">{site.source === 'database' ? 'set here' : 'from server environment'}</span>
          </p>
        )}
        {site && looksLocal(site.siteUrl) && (
          <p role="alert" className="error">
            This address points at your own computer (localhost). QR codes made with it will not work for anyone else. Fix it below.
          </p>
        )}
        <label htmlFor="siteUrl">Website address</label>
        <input id="siteUrl" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://your-site.vercel.app" />
        <p style={{ marginTop: 12 }}>
          <button disabled={busy || !input} onClick={() => save(input)}>Save address</button>
          {here && !looksLocal(here) && input !== here && (
            <button className="secondary" disabled={busy} onClick={() => save(here)}>
              Use this website ({here})
            </button>
          )}
        </p>

        {site && site.count > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <p>
              <b>{site.count}</b> issued certificate{site.count === 1 ? '' : 's'} still carry a QR code for a different address.
              Fixing re-creates their PDF with the correct QR (same certificate number and verification link).
            </p>
            <button disabled={busy || site.running} onClick={fix}>
              {site.running ? 'Fixing…' : `Fix ${site.count} certificate${site.count === 1 ? '' : 's'}`}
            </button>
          </div>
        )}
        {msg && (
          <p role={msg.kind === 'error' ? 'alert' : 'status'} className={msg.kind}>
            {msg.text}
          </p>
        )}
      </div>

      <div className="card">
        <p>
          Signed in as <b>{user?.name}</b> ({user?.email})
        </p>
        <button onClick={logout}>Log out</button>
      </div>
      <div className="card">
        <p>Duplicate-certificate rules are set per event (Create event → “Allow more than one certificate per phone number”).</p>
      </div>
    </>
  );
}
