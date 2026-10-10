'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function NewEvent() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/templates').then(setTemplates).catch(() => undefined); }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '').trim();
    const json: Record<string, unknown> = {
      name: get('name'), organizationName: get('organizationName'), status: get('status'),
      allowDuplicates: f.get('allowDuplicates') === 'on',
    };
    for (const k of ['description', 'certificateTitle', 'issueDate', 'expiryDate', 'templateId', 'eventCode', 'certificateCode']) if (get(k)) json[k] = get(k);
    setBusy(true);
    setError('');
    try {
      const created = await api('/events', { method: 'POST', json });
      router.push(`/events/${created.id}`);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Create event</h1>
      <form className="card" onSubmit={submit}>
        <label htmlFor="name">Event name</label><input id="name" name="name" required minLength={2} />
        <label htmlFor="organizationName">Organization</label><input id="organizationName" name="organizationName" required minLength={2} />
        <label htmlFor="description">Description (printed on the certificate)</label><textarea id="description" name="description" rows={2} />
        <label htmlFor="certificateTitle">Certificate title</label><input id="certificateTitle" name="certificateTitle" placeholder="Certificate of Completion" />
        <div className="row">
          <div><label htmlFor="issueDate">Event / issue date</label><input id="issueDate" name="issueDate" type="date" /></div>
          <div><label htmlFor="expiryDate">Certificate expiry date (optional)</label><input id="expiryDate" name="expiryDate" type="date" /></div>
        </div>
        <div className="row">
          <div><label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="ACTIVE"><option>DRAFT</option><option>ACTIVE</option><option>CLOSED</option><option>ARCHIVED</option></select></div>
          <div><label htmlFor="templateId">Certificate template</label>
            <select id="templateId" name="templateId" defaultValue=""><option value="">Default template</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label htmlFor="eventCode">Custom event code (optional)</label><input id="eventCode" name="eventCode" pattern="[A-Za-z0-9]{4,20}" placeholder="auto-generated" /></div>
        </div>
        <label htmlFor="certificateCode">Certificate number code (2-6 letters, e.g. CSTN gives WTL-CSTN-00001)</label><input id="certificateCode" name="certificateCode" pattern="[A-Za-z0-9]{2,6}" maxLength={6} placeholder="auto from event code" />
        <label><input type="checkbox" name="allowDuplicates" className="check" /> Allow more than one certificate per phone number</label>
        {error && <p role="alert" className="error">{error}</p>}
        <p><button disabled={busy}>Create event</button></p>
      </form>
    </>
  );
}
