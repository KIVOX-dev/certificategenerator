'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/api';

export default function Events() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<{ items: any[]; total: number } | null>(null);
  useEffect(() => {
    const id = setTimeout(() => api(`/events?q=${encodeURIComponent(q)}`).then(setData).catch(() => undefined), 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <>
      <h1>Events</h1>
      <div className="row noprint mb-12">
        <input aria-label="Search events" placeholder="Search events..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div><Link className="btn" href="/events/new">Create event</Link></div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Code</th><th>Organization</th><th>Event date</th><th>Status</th><th>Certificates</th><th></th></tr></thead>
        <tbody>
          {data?.items.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td><td><code>{e.eventCode}</code></td><td>{e.organizationName}</td><td>{fmtDate(e.issueDate)}</td>
              <td><span className={`badge ${e.status}`}>{e.status}</span></td><td>{e.certificateCount}</td>
              <td><Link href={`/events/${e.id}`}>View event</Link></td>
            </tr>
          ))}
          {data && data.items.length === 0 && <tr><td colSpan={7}>No events yet.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
