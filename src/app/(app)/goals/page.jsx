'use client';

import useSWR from 'swr';
import { del } from '@/lib/fetcher';
import { EmptyState, Badge, ConfirmDeleteButton } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { fmtDate } from '@/lib/format';
import { useModal, useToast } from '@/components/UIProvider';
import GoalForm from '@/components/forms/GoalForm';
import ContributeForm from '@/components/forms/ContributeForm';

export default function GoalsPage() {
  const { data, isLoading, mutate } = useSWR('/api/goals');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  function add() {
    openModal('Add Goal', <GoalForm onDone={() => { toast('Goal added'); mutate(); }} />);
  }
  function contribute(goal) {
    openModal(`Contribute to ${goal.name}`, <ContributeForm goal={goal} onDone={() => { toast('Contribution saved'); mutate(); }} />);
  }
  async function remove(id) {
    await del(`/api/goals/${id}`);
    toast('Goal removed');
    mutate();
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Goals & Savings</h2>
        <div className="view-head-actions"><button className="btn-primary" onClick={add}>+ Add goal</button></div>
      </div>

      {isLoading ? (
        <VKLoader inline label="Loading goals" />
      ) : !data?.goals?.length ? (
        <EmptyState title="No goals yet" sub="Set a target and start chipping away at it." />
      ) : (
        <div className="card-grid">
          {data.goals.map((g) => {
            const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
            return (
              <div className="item-card" key={g.id}>
                <ConfirmDeleteButton className="ic-del" onConfirm={() => remove(g.id)} />
                <div className="ic-top">
                  <div>
                    <div className="ic-name">{g.name}</div>
                    <div className="ic-type">{g.priority} priority</div>
                  </div>
                  <Badge tone={pct >= 100 ? 'ok' : pct >= 50 ? 'warn' : 'danger'}>{pct}%</Badge>
                </div>
                <div className="ic-amt num">{currency}{g.current.toLocaleString('en-IN')} <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>/ {currency}{g.target.toLocaleString('en-IN')}</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                {g.targetDate && <div className="ic-sub" style={{ marginTop: 8 }}>Target: {fmtDate(g.targetDate)}</div>}
                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button className="btn-secondary" onClick={() => contribute(g)}>Contribute</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
