'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

export default function ContributeForm({ goal, onDone }) {
  const { closeModal } = useModal();
  const { data: accData } = useSWR('/api/accounts');
  const accounts = (accData?.accounts || []).filter((a) => !a.virtual);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (accounts.length && !accountId) setAccountId(accounts[0].id); }, [accData]); // eslint-disable-line

  async function onSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (!accountId) return setError('Choose an account.');
    setBusy(true);
    try {
      await post(`/api/goals/${goal.id}/contribute`, { amount: Number(amount), accountId });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <p className="muted" style={{ marginBottom: 14 }}>Contributing to <strong>{goal.name}</strong> — currently {Math.round((goal.current / goal.target) * 100) || 0}% funded.</p>
      <div className="form-grid">
        <label>Amount
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>From account
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Contribute'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
