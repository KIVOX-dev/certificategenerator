'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/api';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [ev, setEv] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = () => api(`/events/${id}`).then(setEv).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(status: string) {
    setEv(await api(`/events/${id}`, { method: 'PUT', json: { status } }));
  }
  async function copy() {
    await navigator.clipboard.writeText(ev.registrationUrl);
    setMsg('Registration link copied.');
  }

  if (!ev) return <p>{msg || 'Loading…'}</p>;
  return (
    <>
      <h1>{ev.name}</h1>
      <div className="card">
        <p><span className={`badge ${ev.status}`}>{ev.status}</span> &nbsp; {ev.organizationName} · Event date {fmtDate(ev.issueDate)} · Expiry {fmtDate(ev.expiryDate)}</p>
        <p>Event code: <code>{ev.eventCode}</code></p>
        <p>Registration link: <a href={ev.registrationUrl}>{ev.registrationUrl}</a></p>
        <div className="noprint">
          <button onClick={copy}>COPY REGISTRATION LINK</button>
          <a className="btn" href={ev.qrCodeDataUrl} download={`qr-${ev.eventCode}.png`}>DOWNLOAD QR CODE</a>
          <button className="secondary" onClick={() => window.print()}>Print QR code</button>
        </div>
        {msg && <p role="status" className="ok">{msg}</p>}
      </div>
      <div className="card">
        <h2 className="mt-0">Scan to get your certificate</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qr" src={ev.qrCodeDataUrl} alt={`QR code for ${ev.registrationUrl}`} />
        <p>{ev.name}</p>
      </div>
      <div className="card noprint">
        <h2 className="mt-0">Registration status</h2>
        {['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'].map((s) => (
          <button key={s} className={s === ev.status ? '' : 'secondary'} onClick={() => setStatus(s)}>{s}</button>
        ))}
        <p>Only ACTIVE events accept registrations.</p>
      </div>
    </>
  );
}
