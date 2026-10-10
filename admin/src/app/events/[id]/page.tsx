'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoLoader } from '@/components/LogoLoader';
import { api, fmtDate } from '@/lib/api';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ev, setEv] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = () => api(`/events/${id}`).then(setEv).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(status: string) {
    setEv(await api(`/events/${id}`, { method: 'PUT', json: { status } }));
  }
  async function remove() {
    const count = Number(ev.certificateCount) || 0;
    if (!window.confirm(count > 0
      ? `Delete this event permanently?

This also deletes its ${count} issued certificate(s) and all registrations. Their QR codes will stop working. This cannot be undone.`
      : 'Delete this event permanently? This cannot be undone.')) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      router.push('/events');
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  async function copy() {
    await navigator.clipboard.writeText(ev.registrationUrl);
    setMsg('Registration link copied.');
  }

  if (!ev) return msg ? <p className="error">{msg}</p> : <LogoLoader />;
  return (
    <>
      <h1>{ev.name}</h1>
      <div className="card">
        <div className="detail-head"><span className={`badge ${ev.status}`}>{ev.status}</span><span className="muted">{Number(ev.certificateCount) || 0} certificate(s) issued</span></div>
        <dl className="detail-list">
          <div><dt>Organization</dt><dd>{ev.organizationName}</dd></div>
          <div><dt>Event date</dt><dd>{fmtDate(ev.issueDate)}</dd></div>
          <div><dt>Expiry</dt><dd>{fmtDate(ev.expiryDate)}</dd></div>
          <div><dt>Event code</dt><dd><code>{ev.eventCode}</code></dd></div>
        </dl>
        <label htmlFor="reglink">Registration link</label>
        <input id="reglink" className="link-box" readOnly value={ev.registrationUrl} onFocus={(e) => e.currentTarget.select()} />
        <div className="btn-row noprint">
          <button onClick={copy}>Copy link</button>
          <a className="btn secondary" href={ev.qrCodeDataUrl} download={`qr-${ev.eventCode}.png`}>Download QR code</a>
          <button className="secondary" onClick={() => window.print()}>Print QR code</button>
        </div>
        {msg && <p role="status" className="ok">{msg}</p>}
      </div>
      <div className="card center">
        <h2 className="mt-0">Scan to get your certificate</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qr" src={ev.qrCodeDataUrl} alt={`QR code for ${ev.registrationUrl}`} />
        <p className="muted">{ev.name}</p>
      </div>
      <div className="card noprint">
        <h2 className="mt-0">Registration status</h2>
        <div className="segmented" role="group" aria-label="Registration status">
          {['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'].map((st) => (
            <button key={st} className={st === ev.status ? '' : 'secondary'} aria-pressed={st === ev.status} onClick={() => setStatus(st)}>{st}</button>
          ))}
        </div>
        <p className="muted">Only ACTIVE events accept registrations.</p>
      </div>
      <div className="card danger-zone noprint">
        <h2 className="mt-0">Delete event</h2>
        <p className="muted">Permanently removes this event, its registrations and its issued certificates. Their QR codes stop working.</p>
        <button className="danger" onClick={remove}>Delete event</button>
      </div>
    </>
  );
}
