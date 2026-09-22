'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/fetcher';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">
            <Image src="/vklogo.png" alt="VEKTRA" width={28} height={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>VEKTRA</div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Know where your money goes</div>
          </div>
        </div>

        <h1 className="auth-title">Log in</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Use the same email and password as your Ledger expense tracker account — VEKTRA uses it to identify your data, it&rsquo;s never stored here.
        </p>

        {error && <div className="auth-error show">{error}</div>}

        <form onSubmit={onSubmit}>
          <label className="auth-field">
            Email
            <input type="email" required autoComplete="username" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="auth-field">
            Password
            <input type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary auth-submit" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
