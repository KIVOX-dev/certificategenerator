'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/api';

export default function Events() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<{ items: any[]; total: number } | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api(`/events?q=${encodeURIComponent(q)}`).then(setData).catch(() => undefined), [q]);
  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  async function remove(e: any) {
    const count = Number(e.certificateCount) || 0;
    if (!window.confirm(count > 0
      ? `"${e.name}" has ${count} issued certificate(s). It will be archived (closed to new registrations) so those certificates stay verifiable. Continue?`
      : `Delete "${e.name}" permanently? This cannot be undone.`)) return;
    try {
      const r = await api(`/events/${e.id}`, { method: 'DELETE' });
      setMsg(r.deleted ? `"${e.name}" was deleted.` : `"${e.name}" was archived because it has issued certificates.`);
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <>
      <h1>Events</h1>
      <div className="row noprint mb-12">
        <input aria-label="Search events" placeholder="Search events..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div><Link className="btn" href="/events/new">Create event</Link></div>
      </div>
      {msg && <p role="status" className="ok">{msg}</p>}
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Code</th><th>Organization</th><th>Event date</th><th>Status</th><th>Certificates</th><th></th></tr></thead>
        <tbody>
          {data?.items.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td><td><code>{e.eventCode}</code></td><td>{e.organizationName}</td><td>{fmtDate(e.issueDate)}</td>
              <td><span className={`badge ${e.status}`}>{e.status}</span></td><td>{e.certificateCount}</td>
              <td className="nowrap">
                <Link href={`/events/${e.id}`}>View event</Link>{' '}
                {e.status !== 'ARCHIVED' && <button type="button" className="link-danger" onClick={() => remove(e)} aria-label={`Delete ${e.name}`}>Delete</button>}
              </td>
            </tr>
          ))}
          {data && data.items.length === 0 && <tr><td colSpan={7}>No events yet.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
