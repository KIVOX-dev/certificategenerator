'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const labels: [string, string][] = [
  ['totalEvents', 'Total Events'],
  ['totalRegistrations', 'Total Registrations'],
  ['totalCertificates', 'Total Certificates'],
  ['activeCertificates', 'Active Certificates'],
  ['revokedCertificates', 'Revoked Certificates'],
  ['todaysCertificates', "Today's Certificates"],
];

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => { api('/stats').then(setStats).catch(() => undefined); }, []);
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid">
        {labels.map(([key, label]) => (
          <div className="card stat" key={key}><b>{stats ? stats[key] : '…'}</b>{label}</div>
        ))}
      </div>
    </>
  );
}
