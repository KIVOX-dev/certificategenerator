'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/api';

const IMAGE_EXAMPLE = JSON.stringify(
  {
    backgroundUrl: 'https://example.com/certificate-background.png',
    pageWidthMm: 297,
    pageHeightMm: 210,
    masks: [{ x: 20, y: 40, width: 60, height: 10 }],
    fields: {
      recipientName: { x: 50, y: 42, width: 70, align: 'center', fontSize: 6, bold: true, upper: true },
      eventName: { x: 50, y: 58, width: 70, align: 'center', fontSize: 2.6 },
      issueDate: { x: 15, y: 82, fontSize: 1.6 },
      certificateNumber: { x: 15, y: 87, fontSize: 1.6 },
      qr: { x: 80, y: 70, size: 9 },
    },
  },
  null,
  2,
);

export default function Templates() {
  const [list, setList] = useState<any[]>([]);
  const [type, setType] = useState<'HTML' | 'IMAGE'>('HTML');
  const [error, setError] = useState('');
  const load = () => api('/templates').then(setList).catch(() => undefined);
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError('');
    try {
      await api('/templates', { method: 'POST', json: { name: String(f.get('name')), type, templateData: String(f.get('templateData')), isActive: true } });
      e.currentTarget.reset();
      load();
    } catch (err: any) { setError(err.message); }
  }
  const makeDefault = async (id: string) => { await api(`/templates/${id}`, { method: 'PUT', json: { isDefault: true } }); load(); };

  return (
    <>
      <h1>Templates</h1>
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Updated</th><th></th></tr></thead>
        <tbody>{list.map((t) => (
          <tr key={t.id}><td>{t.name}</td><td>{t.type}</td><td>{t.isDefault ? '✓ Default' : ''}</td><td>{fmtDate(t.updatedAt)}</td>
            <td>{!t.isDefault && <button className="secondary" onClick={() => makeDefault(t.id)}>Make default</button>}</td></tr>
        ))}</tbody>
      </table></div>
      <h2>Add template</h2>
      <form className="card" onSubmit={create}>
        <label htmlFor="tname">Name</label><input id="tname" name="name" required minLength={2} />
        <label htmlFor="ttype">Type</label>
        <select id="ttype" value={type} onChange={(e) => setType(e.target.value as any)}><option>HTML</option><option>IMAGE</option></select>
        <label htmlFor="tdata">{type === 'HTML' ? 'HTML source' : 'JSON specification'}</label>
        <textarea id="tdata" name="templateData" rows={12} required key={type} defaultValue={type === 'IMAGE' ? IMAGE_EXAMPLE : ''} className="mono" />
        {error && <p role="alert" className="error">{error}</p>}
        <p><button>Add template</button></p>
      </form>
    </>
  );
}
