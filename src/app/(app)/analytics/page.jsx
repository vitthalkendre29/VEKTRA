'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { StatCard, CategoryBars } from '@/components/ui';
import VKLoader from '@/components/VKLoader';

const PERIODS = [
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useSWR(`/api/analytics?type=${period}&offset=${offset}`);
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';

  function changePeriod(p) {
    setPeriod(p);
    setOffset(0);
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Analytics</h2>
      </div>

      <div className="pill-tabs">
        {PERIODS.map((p) => (
          <button key={p.key} className={`btn-secondary ${period === p.key ? 'active' : ''}`} onClick={() => changePeriod(p.key)}>{p.label}</button>
        ))}
      </div>

      <div className="btn-row" style={{ marginBottom: 16, alignItems: 'center' }}>
        <button className="btn-secondary" onClick={() => setOffset((o) => o - 1)}>← Prev</button>
        <span style={{ fontWeight: 600, minWidth: 140, textAlign: 'center' }}>{data?.label || '…'}</span>
        <button className="btn-secondary" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0}>Next →</button>
      </div>

      {isLoading || !data ? (
        <VKLoader inline label="Crunching numbers" />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Income" value={`${currency}${data.income.toLocaleString('en-IN')}`} accent="income" />
            <StatCard label="Expenses" value={`${currency}${data.expense.toLocaleString('en-IN')}`} accent="expense" />
            <StatCard label="Savings rate" value={`${data.savingsRate}%`} accent="savings" />
            <StatCard label="Invest rate" value={`${data.investRate}%`} accent="invest" />
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Spending by category</h3></div>
            <CategoryBars categories={data.categories} currency={currency} />
          </div>
        </>
      )}
    </div>
  );
}
