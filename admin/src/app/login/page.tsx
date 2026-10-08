'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/login', { method: 'POST', json: { email, password } });
      router.replace('/');
    } catch (err: any) {
      setError(err.status === 429 ? 'Too many attempts. Please wait a minute.' : 'Incorrect email or password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card login" onSubmit={submit}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="We The Leaders - Lead The Change" className="login-logo" width={280} height={61} />
      <h1>Admin Login</h1>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p role="alert" className="error">{error}</p>}
      <p><button type="submit" disabled={busy}>LOGIN</button></p>
    </form>
  );
}
