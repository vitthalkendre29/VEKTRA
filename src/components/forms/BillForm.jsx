'use client';
import { useState } from 'react';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

export default function BillForm({ onDone }) {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [reminderDays, setReminderDays] = useState(3);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required.');
    setBusy(true);
    try {
      await post('/api/bills', { name, amount: Number(amount) || 0, dueDate: dueDate || undefined, frequency, reminderDays: Number(reminderDays) || 3 });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Bill name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" required />
        </label>
        <label>Amount
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label>Frequency
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="annual">Annual</option>
          </select>
        </label>
        <label>Remind me (days before)
          <input type="number" min="0" max="30" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add bill'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
