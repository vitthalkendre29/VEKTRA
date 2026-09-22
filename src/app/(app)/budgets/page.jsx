'use client';

import useSWR from 'swr';
import { del } from '@/lib/fetcher';
import { EmptyState, Badge, ConfirmDeleteButton } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { useModal, useToast } from '@/components/UIProvider';
import BudgetForm from '@/components/forms/BudgetForm';

export default function BudgetsPage() {
  const { data, isLoading, mutate } = useSWR('/api/budgets');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  function add() {
    openModal('Add Budget', <BudgetForm onDone={() => { toast('Budget added'); mutate(); }} />);
  }

  async function remove(id) {
    await del(`/api/budgets/${id}`);
    toast('Budget removed');
    mutate();
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Budgets</h2>
        <div className="view-head-actions"><button className="btn-primary" onClick={add}>+ Add budget</button></div>
      </div>

      {isLoading ? (
        <VKLoader inline label="Loading budgets" />
      ) : !data?.budgets?.length ? (
        <EmptyState title="No budgets yet" sub="Set a monthly cap on a Ledger category to start tracking it." />
      ) : (
        <div className="card-grid">
          {data.budgets.map((b) => {
            const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
            const tone = pct >= 100 ? 'danger' : pct >= b.alertPercent ? 'warn' : 'ok';
            return (
              <div className="item-card" key={b.id}>
                <ConfirmDeleteButton className="ic-del" onConfirm={() => remove(b.id)} />
                <div className="ic-top">
                  <div>
                    <div className="ic-name">{b.category}</div>
                    <div className="ic-type">Monthly</div>
                  </div>
                  <Badge tone={tone}>{pct}%</Badge>
                </div>
                <div className="ic-amt num">{currency}{b.spent.toLocaleString('en-IN')} <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>/ {currency}{b.amount.toLocaleString('en-IN')}</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
