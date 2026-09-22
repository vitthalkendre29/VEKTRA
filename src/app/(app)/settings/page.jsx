'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { apiFetch, put } from '@/lib/fetcher';
import { useToast } from '@/components/UIProvider';
import LegacyImport from './LegacyImport';

const CURRENCIES = ['₹', '$', '€', '£'];

export default function SettingsPage() {
  const { data, mutate } = useSWR('/api/profile');
  const toast = useToast();
  const router = useRouter();

  const [currency, setCurrency] = useState('₹');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [emergencyFundMonths, setEmergencyFundMonths] = useState(6);

  useEffect(() => {
    if (data) {
      setCurrency(data.currency);
      setMonthlyIncome(data.monthlyIncome || '');
      setEmergencyFundMonths(data.emergencyFundMonths || 6);
    }
  }, [data]);

  async function save() {
    await put('/api/profile', { currency, monthlyIncome: Number(monthlyIncome) || 0, emergencyFundMonths: Number(emergencyFundMonths) || 6 });
    toast('Settings saved');
    mutate();
  }

  async function logout() {
    if (!confirm('Log out of VEKTRA?')) return;
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="view active">
      <div className="view-head"><h2>Settings</h2></div>

      <div className="panel">
        <div className="panel-head"><h3>Profile</h3></div>
        <div className="settings-row">
          <div><div className="sr-label">Name</div><div className="sr-sub">Managed by your Ledger account</div></div>
          <span>{data?.name}</span>
        </div>
        <div className="settings-row">
          <div><div className="sr-label">Email</div></div>
          <span>{data?.email}</span>
        </div>
        <div className="settings-row">
          <div><div className="sr-label">Currency</div></div>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="settings-row">
          <div><div className="sr-label">Monthly income</div><div className="sr-sub">Used as a fallback for your Health Score</div></div>
          <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
        </div>
        <div className="settings-row">
          <div><div className="sr-label">Emergency fund target</div><div className="sr-sub">Months of essential expenses</div></div>
          <input type="number" min="1" value={emergencyFundMonths} onChange={(e) => setEmergencyFundMonths(e.target.value)} />
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={save}>Save changes</button>
        </div>
      </div>

      <LegacyImport />

      <div className="panel">
        <div className="panel-head"><h3>Account</h3></div>
        <p className="muted" style={{ marginBottom: 14 }}>VEKTRA identifies you through your Ledger login — there&rsquo;s no separate password to manage here.</p>
        <button className="btn-danger" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
