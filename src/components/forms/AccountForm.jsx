'use client';
import { useState } from 'react';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

const TYPES = ['bank', 'cash', 'wallet', 'credit_card', 'investment', 'other'];

export default function AccountForm({ onDone }) {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Account name is required.');
    setBusy(true);
    try {
      await post('/api/accounts', { name, type, balance: Number(balance) || 0 });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid single">
        <label>Account name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings" required />
        </label>
        <label>Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label>Opening balance
          <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add account'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
