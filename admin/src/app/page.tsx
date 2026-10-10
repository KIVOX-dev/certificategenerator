'use client';
import { useEffect, useState } from 'react';
import { DailyChart, DayPoint, Donut, HBars } from '@/components/Charts';
import { api } from '@/lib/api';

interface Stats {
  totalEvents: number; totalRegistrations: number; totalCertificates: number; activeCertificates: number;
  revokedCertificates: number; expiredCertificates: number; todaysCertificates: number;
  certificatesPerDay: DayPoint[]; topEvents: { name: string; count: number }[];
}

const labels: [keyof Stats, string][] = [
  ['totalEvents', 'Total Events'],
  ['totalRegistrations', 'Total Registrations'],
  ['totalCertificates', 'Total Certificates'],
  ['activeCertificates', 'Active Certificates'],
  ['revokedCertificates', 'Revoked Certificates'],
  ['todaysCertificates', "Today's Certificates"],
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { api('/stats').then(setStats).catch(() => undefined); }, []);
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid">
        {labels.map(([key, label]) => (
          <div className="card stat" key={key}><b>{stats ? (stats[key] as number) : '…'}</b>{label}</div>
        ))}
      </div>
      {stats && (
        <div className="charts">
          <section className="card wide">
            <h2>Certificates issued — last 30 days</h2>
            <DailyChart data={stats.certificatesPerDay} />
          </section>
          <section className="card">
            <h2>Certificate status</h2>
            <Donut slices={[
              { label: 'Active', value: stats.activeCertificates, color: '#1f7a54' },
              { label: 'Revoked', value: stats.revokedCertificates, color: '#e5132b' },
              { label: 'Expired', value: stats.expiredCertificates, color: '#9b6829' },
            ]} />
          </section>
          <section className="card">
            <h2>Top events by certificates</h2>
            <HBars rows={stats.topEvents} />
          </section>
        </div>
      )}
    </>
  );
}
