'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { del } from '@/lib/fetcher';
import { EmptyState, TypeChip, ConfirmDeleteButton } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { useModal, useToast } from '@/components/UIProvider';
import TransactionForm from '@/components/forms/TransactionForm';

const AMT_CLASS = { income: 'amt-in', expense: 'amt-out', savings: 'amt-out', investment: 'amt-out', transfer: 'amt-neutral' };

export default function TransactionsPage() {
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const params = new URLSearchParams({ type });
  const { data, isLoading, mutate } = useSWR(`/api/transactions?${params.toString()}`);
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  const rows = useMemo(() => {
    const all = data?.transactions || [];
    if (!q.trim()) return all;
    const needle = q.toLowerCase();
    return all.filter((r) => (r.notes || '').toLowerCase().includes(needle) || (r.merchant || '').toLowerCase().includes(needle) || (r.category || '').toLowerCase().includes(needle));
  }, [data, q]);

  function add() {
    openModal('Add Transaction', <TransactionForm defaultType="income" onDone={() => { toast('Transaction saved'); mutate(); }} />);
  }

  async function remove(id) {
    await del(`/api/transactions/${id}`);
    toast('Transaction deleted');
    mutate();
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Transactions</h2>
        <div className="view-head-actions">
          <button className="btn-primary" onClick={add}>+ Add transaction</button>
        </div>
      </div>

      <div className="filter-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
          <option value="investment">Investment</option>
          <option value="savings">Savings</option>
        </select>
        <input placeholder="Search notes, merchant, category…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <VKLoader inline label="Loading transactions" />
      ) : rows.length === 0 ? (
        <EmptyState title="No transactions" sub="Try a different filter, or add one." />
      ) : (
        <div className="txn-table-wrap">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>Category</th><th>Notes</th><th className="right">Amount</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><TypeChip type={r.type} /></td>
                  <td>{r.category || '—'}</td>
                  <td>{r.merchant || r.notes || (r.source === 'ledger' ? 'From Ledger' : '—')}</td>
                  <td className={`right ${AMT_CLASS[r.type]}`}>{r.type === 'income' ? '+' : '-'}{currency}{r.amount.toLocaleString('en-IN')}</td>
                  <td>{r.source !== 'ledger' && <ConfirmDeleteButton onConfirm={() => remove(r.id)} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
