'use client';
import { useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/api';

export default function Templates() {
  const [list, setList] = useState<any[]>([]);
  const load = () => api('/templates').then(setList).catch(() => undefined);
  useEffect(() => { load(); }, []);

  const makeDefault = async (id: string) => { await api(`/templates/${id}`, { method: 'PUT', json: { isDefault: true } }); load(); };

  return (
    <>
      <h1>Templates</h1>
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Updated</th><th></th></tr></thead>
        <tbody>{list.map((t) => (
          <tr key={t.id}><td data-label="Name">{t.name}</td><td data-label="Type">{t.type}</td><td data-label="Default">{t.isDefault ? '✓ Default' : ''}</td><td data-label="Updated">{fmtDate(t.updatedAt)}</td>
            <td className="actions">{!t.isDefault && <button className="secondary" onClick={() => makeDefault(t.id)}>Make default</button>}</td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
