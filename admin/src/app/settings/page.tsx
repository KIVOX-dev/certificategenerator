'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  useEffect(() => { api('/auth/me').then((r) => setUser(r.user)).catch(() => undefined); }, []);
  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    router.replace('/login');
  }
  return (
    <>
      <h1>Settings</h1>
      <div className="card">
        <p>Signed in as <b>{user?.name}</b> ({user?.email})</p>
        <button onClick={logout}>Log out</button>
      </div>
      <div className="card">
        <p>Duplicate-certificate rules are set per event (Create event → “Allow more than one certificate per phone number”).</p>
      </div>
    </>
  );
}
