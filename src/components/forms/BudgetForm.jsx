'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

export default function BudgetForm({ onDone }) {
  const { closeModal } = useModal();
  const { data } = useSWR('/api/categories');
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [alertPercent, setAlertPercent] = useState(80);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!categoryName) return setError('Choose a category.');
    if (!amount || Number(amount) <= 0) return setError('Enter a valid monthly amount.');
    setBusy(true);
    try {
      await post('/api/budgets', { categoryName, amount: Number(amount), alertPercent: Number(alertPercent) });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid single">
        <label>Category
          <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required>
            <option value="">Select…</option>
            {(data?.ledger || []).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </label>
        <label>Monthly budget amount
          <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>Alert me at (% used)
          <input type="number" min="1" max="100" value={alertPercent} onChange={(e) => setAlertPercent(e.target.value)} />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add budget'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
