'use client';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icons';
import { api, fmtDate } from '@/lib/api';

export default function Certificates() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: any[]; total: number; limit: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/events?limit=100').then((r) => setEvents(r.items)).catch(() => undefined); }, []);

  const load = useCallback(
    () => api(`/certificates?q=${encodeURIComponent(q)}&status=${status}&eventId=${eventId}&page=${page}`).then(setData).catch((e) => setError(e.message)),
    [q, status, eventId, page],
  );
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);

  async function exportExcel() {
    setError('');
    try {
      const res = await fetch(`/api/admin/certificates/export?q=${encodeURIComponent(q)}&status=${status}&eventId=${eventId}`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('The Excel file could not be created. Please try again.');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificates-${new Date().toLocaleDateString('en-CA')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function act(id: string, action: 'revoke' | 'restore') {
    if (action === 'revoke' && !confirm('Revoke this certificate? It will no longer verify as valid.')) return;
    await api(`/certificates/${id}/${action}`, { method: 'POST' });
    load();
  }

  return (
    <>
      <h1>Certificates</h1>
      <div className="grid noprint mb-12">
        <div className="card stat"><b>{data ? data.total : '…'}</b>{eventId || status || q ? 'Matching certificates' : 'Total certificates'}</div>
      </div>
      <div className="row noprint mb-12">
        <input aria-label="Search certificates" placeholder="Search certificates... (name, phone, certificate number, event)" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option><option>ACTIVE</option><option>REVOKED</option><option>EXPIRED</option>
        </select>
        <select aria-label="Event" value={eventId} onChange={(e) => { setEventId(e.target.value); setPage(1); }}>
          <option value="">All events</option>{events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <div><button type="button" className="flow" onClick={exportExcel}>Download Excel <Icon name="download" size={18} /></button></div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap"><table>
        <thead><tr><th>Number</th><th>Name</th><th>Phone</th><th>Event</th><th>Issued</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {data?.items.map((c) => (
            <tr key={c.id}>
              <td>{c.certificateNumber}</td><td>{c.recipientName}</td><td>{c.phone}</td><td>{c.eventName}</td><td>{fmtDate(c.issuedAt)}</td>
              <td><span className={`badge ${c.status}`}>{c.status}</span></td>
              <td className="nowrap">
                <a href={`/api/admin/certificates/${c.id}/preview`} target="_blank" rel="noopener">View</a> ·{' '}
                <a href={`/api/admin/certificates/${c.id}/pdf`}>Download</a> ·{' '}
                {c.storedStatus === 'REVOKED'
                  ? <button className="secondary" onClick={() => act(c.id, 'restore')}>Restore</button>
                  : <button className="danger" onClick={() => act(c.id, 'revoke')}>Revoke</button>}
              </td>
            </tr>
          ))}
          {data && data.items.length === 0 && <tr><td colSpan={7}>No certificates found.</td></tr>}
        </tbody>
      </table></div>
      {data && (
        <div className="pager noprint">
          <button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {Math.max(1, Math.ceil(data.total / data.limit))} ({data.total} total)</span>
          <button className="secondary" disabled={page * data.limit >= data.total} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
