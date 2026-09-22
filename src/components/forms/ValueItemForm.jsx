'use client';
import { useState } from 'react';
import { post } from '@/lib/fetcher';
import { useModal } from '../UIProvider';

// Shared shape for the simple "name + value" resources: assets & liabilities.
export default function ValueItemForm({ kind, onDone }) {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const endpoint = kind === 'asset' ? '/api/assets' : '/api/liabilities';

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required.');
    setBusy(true);
    try {
      await post(endpoint, { name, value: Number(value) || 0 });
      onDone?.();
      closeModal();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === 'asset' ? 'e.g. Car, Jewellery' : 'e.g. Credit card dues'} required />
        </label>
        <label>Value
          <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : `Add ${kind}`}</button>
        <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
}
