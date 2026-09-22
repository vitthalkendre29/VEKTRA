'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

const TYPES = ['Mutual Fund', 'Stocks', 'ETF', 'Fixed Deposit', 'PPF', 'EPF', 'NPS', 'Gold', 'Real Estate', 'Crypto', 'Other'];

export default function HoldingForm({ onDone }) {
  const { closeModal } = useModal();
  const { data: goalData } = useSWR('/api/goals');
  const [name, setName] = useState('');
  const [type, setType] = useState('Mutual Fund');
  const [invested, setInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [sipAmount, setSipAmount] = useState('');
  const [goalId, setGoalId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required.');
    setBusy(true);
    try {
      await post('/api/holdings', { name, type, invested: Number(invested) || 0, currentValue: Number(currentValue) || 0, sipAmount: Number(sipAmount) || 0, goalId: goalId || undefined });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nifty 50 Index Fund" required />
        </label>
        <label>Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>Invested amount
          <input type="number" min="0" value={invested} onChange={(e) => setInvested(e.target.value)} />
        </label>
        <label>Current value
          <input type="number" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />
        </label>
        <label>Monthly SIP (optional)
          <input type="number" min="0" value={sipAmount} onChange={(e) => setSipAmount(e.target.value)} />
        </label>
        <label>Linked goal (optional)
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">None</option>
            {(goalData?.goals || []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add holding'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
