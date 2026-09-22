'use client';
import { useState } from 'react';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

export default function GoalForm({ onDone }) {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [monthly, setMonthly] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !target) return setError('Name and target amount are required.');
    setBusy(true);
    try {
      await post('/api/goals', { name, target: Number(target), current: Number(current) || 0, targetDate: targetDate || undefined, priority, monthly: Number(monthly) || 0 });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Goal name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New laptop" required />
        </label>
        <label>Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </label>
        <label>Target amount
          <input type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)} required />
        </label>
        <label>Already saved
          <input type="number" min="0" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label>Target date (optional)
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </label>
        <label>Planned monthly contribution
          <input type="number" min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add goal'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
