'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { post } from '@/lib/fetcher';
import { todayISO } from '@/lib/format';
import { useModal, useToast } from '../UIProvider';

const TYPES = ['income', 'transfer', 'investment', 'savings'];

export default function TransactionForm({ defaultType = 'income', onDone }) {
  const { data: accData } = useSWR('/api/accounts');
  const { data: catData } = useSWR('/api/categories');
  const { data: goalData } = useSWR(defaultType === 'savings' ? '/api/goals' : null);
  const { closeModal } = useModal();

  const accounts = (accData?.accounts || []).filter((a) => !a.virtual);
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id);
  }, [accData]); // eslint-disable-line

  const categoryOptions = catData?.vektra?.[type] || [];

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (!accountId) return setError('Choose an account.');
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) return setError('Choose two different accounts.');
    setBusy(true);
    try {
      await post('/api/transactions', {
        type, amount: Number(amount), date, category, accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        goalId: type === 'savings' ? goalId || undefined : undefined,
        merchant, notes,
      });
      onDone?.();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="pill-tabs">
        {TYPES.map((t) => (
          <button type="button" key={t} className={`btn-secondary ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <p className="inline-note">Expenses aren&rsquo;t added here — VEKTRA reads those live from your Ledger app.</p>

      <div className="form-grid">
        <label>Amount
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </label>
        <label>Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select…</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>{type === 'transfer' ? 'From account' : 'Account'}
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>

        {type === 'transfer' && (
          <label>To account
            <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
              <option value="">Select…</option>
              {accounts.filter((a) => a.id !== accountId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
        )}

        {type === 'savings' && (
          <label>Towards goal (optional)
            <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
              <option value="">None</option>
              {(goalData?.goals || []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}

        <label>Merchant / payee
          <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Optional" />
        </label>
      </div>

      <label>Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      </label>

      {error && <p className="field-error">{error}</p>}

      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save transaction'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
