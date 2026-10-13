'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { LogoLoader } from '@/components/LogoLoader';
import { api } from '@/lib/api';

// The API stores dates as UTC midnight of the picked day, so the first 10 characters are the picked date.
const dateValue = (d?: string | null) => (d ? String(d).slice(0, 10) : '');

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ev, setEv] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/events/${id}`).then(setEv).catch((e) => setError(e.message));
    api('/templates').then(setTemplates).catch(() => undefined);
  }, [id]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '').trim();
    const json: Record<string, unknown> = {
      name: get('name'),
      organizationName: get('organizationName'),
      description: get('description'),
      venue: get('venue'),
      status: get('status'),
      allowDuplicates: f.get('allowDuplicates') === 'on',
      expiryDate: get('expiryDate') || null, // empty clears the expiry
    };
    // These must not be blank, so leave them untouched when the field is empty.
    for (const k of ['certificateTitle', 'issueDate', 'templateId']) if (get(k)) json[k] = get(k);
    setBusy(true);
    setError('');
    try {
      await api(`/events/${id}`, { method: 'PUT', json });
      router.push(`/events/${id}`);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!ev) return error ? <p role="alert" className="error">{error}</p> : <LogoLoader />;
  return (
    <>
      <h1>Edit event</h1>
      <p className="muted">Event code <code>{ev.eventCode}</code> never changes, so printed QR codes keep working.</p>
      <form className="card" onSubmit={submit}>
        <label htmlFor="name">Event name</label>
        <input id="name" name="name" required minLength={2} defaultValue={ev.name} />
        <label htmlFor="organizationName">Organization</label>
        <input id="organizationName" name="organizationName" required minLength={2} defaultValue={ev.organizationName} />
        <label htmlFor="description">Description (shown on the website only, not on certificates)</label>
        <textarea id="description" name="description" rows={5} maxLength={1000} defaultValue={ev.description ?? ''} />
        <label htmlFor="venue">Venue / place (shown on the website)</label>
        <input id="venue" name="venue" maxLength={200} defaultValue={ev.venue ?? ''} placeholder="e.g. Codissia Trade Fair Complex, Coimbatore" />
        <label htmlFor="certificateTitle">Certificate title</label>
        <input id="certificateTitle" name="certificateTitle" defaultValue={ev.certificateTitle ?? ''} placeholder="Certificate of Completion" />
        <div className="row">
          <div><label htmlFor="issueDate">Event / issue date</label><input id="issueDate" name="issueDate" type="date" defaultValue={dateValue(ev.issueDate)} /></div>
          <div><label htmlFor="expiryDate">Certificate expiry date (optional)</label><input id="expiryDate" name="expiryDate" type="date" defaultValue={dateValue(ev.expiryDate)} /></div>
        </div>
        <div className="row">
          <div>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={ev.status}>
              <option>DRAFT</option><option>ACTIVE</option><option>CLOSED</option><option>ARCHIVED</option>
            </select>
          </div>
          <div>
            <label htmlFor="templateId">Certificate template</label>
            <select id="templateId" name="templateId" defaultValue={ev.templateId ?? ''}>
              <option value="">Default template</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <label><input type="checkbox" name="allowDuplicates" className="check" defaultChecked={ev.allowDuplicates} /> Allow more than one certificate per phone number</label>
        <p className="muted">Changes to the title and template apply to certificates issued from now on. Certificates already issued are not changed.</p>
        {error && <p role="alert" className="error">{error}</p>}
        <div className="btn-row">
          <button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          <Link className="btn secondary" href={`/events/${id}`}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
