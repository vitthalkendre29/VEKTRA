'use client';
import { useState } from 'react';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

export default function LoanForm({ onDone }) {
  const { closeModal } = useModal();
  const [type, setType] = useState('');
  const [lender, setLender] = useState('');
  const [outstanding, setOutstanding] = useState('');
  const [rate, setRate] = useState('');
  const [emi, setEmi] = useState('');
  const [nextPayment, setNextPayment] = useState('');
  const [reminderDays, setReminderDays] = useState(3);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!type.trim()) return setError('Loan type is required.');
    setBusy(true);
    try {
      await post('/api/loans', { type, lender, outstanding: Number(outstanding) || 0, rate: Number(rate) || 0, emi: Number(emi) || 0, nextPayment: nextPayment || undefined, reminderDays: Number(reminderDays) || 3 });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Loan type
          <input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Home Loan" required />
        </label>
        <label>Lender
          <input value={lender} onChange={(e) => setLender(e.target.value)} placeholder="e.g. HDFC Bank" />
        </label>
        <label>Outstanding amount
          <input type="number" min="0" value={outstanding} onChange={(e) => setOutstanding(e.target.value)} />
        </label>
        <label>Interest rate (%)
          <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
        <label>Monthly EMI
          <input type="number" min="0" value={emi} onChange={(e) => setEmi(e.target.value)} />
        </label>
        <label>Next payment date
          <input type="date" value={nextPayment} onChange={(e) => setNextPayment(e.target.value)} />
        </label>
        <label>Remind me (days before)
          <input type="number" min="0" max="30" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add loan'}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
