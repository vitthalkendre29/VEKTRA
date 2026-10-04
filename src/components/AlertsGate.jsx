'use client';

import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { post } from '@/lib/fetcher';
import { useModal } from './UIProvider';

// Silent watcher, mounted once inside the app shell. Checks once whether
// today's due-bills / over-budget alert has already been shown on this
// account (any device) — if not, and there's something to say, pops it
// open and immediately acks it so it won't repeat today.
export default function AlertsGate() {
  const { data } = useSWR('/api/alerts');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal } = useModal();
  const shown = useRef(false);

  useEffect(() => {
    if (!data || shown.current) return;
    if (data.shownToday) return;
    const hasBudgets = data.budgets?.length > 0;
    const hasBills = data.bills?.length > 0;
    if (!hasBudgets && !hasBills) return;

    shown.current = true;
    openModal('Today at a glance', <AlertsBody data={data} currency={currency} />);
    post('/api/alerts', {}).catch(() => {});
  }, [data]); // eslint-disable-line

  return null;
}

function AlertsBody({ data, currency }) {
  return (
    <div>
      {data.budgets?.length > 0 && (
        <>
          <p className="section-title" style={{ marginTop: 0 }}>Budgets</p>
          <div className="insight-list">
            {data.budgets.map((b, i) => (
              <div key={i} className={`insight-item ${b.over ? 'danger' : 'warn'}`}>
                {b.category} is {b.over ? 'over budget' : `at ${b.pct}% of its limit`} — {currency}{b.spent.toLocaleString('en-IN')} of {currency}{b.amount.toLocaleString('en-IN')}
              </div>
            ))}
          </div>
        </>
      )}

      {data.bills?.length > 0 && (
        <>
          <p className="section-title">Due soon</p>
          <div className="upcoming-list">
            {data.bills.map((b, i) => (
              <div className="upcoming-row" key={i}>
                <div>
                  <span className="u-name">{b.name}</span>
                  <span className="u-date">{b.overdue ? 'Overdue' : b.diffDays === 0 ? 'Due today' : `Due in ${b.diffDays} day${b.diffDays === 1 ? '' : 's'}`}</span>
                </div>
                {b.amount ? <span className="u-amt num">{currency}{b.amount.toLocaleString('en-IN')}</span> : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
