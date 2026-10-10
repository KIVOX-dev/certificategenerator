'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/api';

export default function Registrations() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: any[]; total: number; limit: number } | null>(null);

  const load = useCallback(() => api(`/registrations?q=${encodeURIComponent(q)}&page=${page}`).then(setData).catch(() => undefined), [q, page]);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);

  async function remove(id: string) {
    if (!confirm('Delete this registration? Its certificate will be revoked and the phone number can register again.')) return;
    await api(`/registrations/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <h1>Registrations</h1>
      <input aria-label="Search registrations" placeholder="Search by name or phone..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="mb-12" />
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Phone</th><th>Event</th><th>Certificate</th><th>Date</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {data?.items.map((r) => (
            <tr key={r.id}>
              <td>{r.fullName}</td><td>{r.phone}</td><td>{r.eventName}</td><td>{r.certificateNumber ?? '—'}</td><td>{fmtDate(r.createdAt)}</td>
              <td>{r.certificateStatus ? <span className={`badge ${r.certificateStatus}`}>{r.certificateStatus}</span> : '—'}</td>
              <td><button className="danger" onClick={() => remove(r.id)}>Delete</button></td>
            </tr>
          ))}
          {data && data.items.length === 0 && <tr><td colSpan={7}>No registrations found.</td></tr>}
        </tbody>
      </table></div>
      {data && (
        <div className="pager">
          <button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {Math.max(1, Math.ceil(data.total / data.limit))}</span>
          <button className="secondary" disabled={page * data.limit >= data.total} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
