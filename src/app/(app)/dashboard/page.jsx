'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { StatCard, CategoryBars, HealthRing, CurrentFlowBar, InsightList, UpcomingList, GoalMiniList, SkeletonBlock } from '@/components/ui';
import VKLoader from '@/components/VKLoader';

export default function DashboardPage() {
  const { data, isLoading } = useSWR('/api/dashboard');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';

  if (isLoading || !data) return <VKLoader inline label="Loading dashboard" />;

  const { totalBalance, healthScore, monthSummary, topCategories, insights, upcoming, goals } = data;

  return (
    <div className="view active">
      <div className="hero-card">
        <div className="hero-top">
          <div>
            <div className="hero-eyebrow">Total balance</div>
            <div className="hero-title">Across all accounts</div>
            <div className="hero-amount num">{currency}{Math.round(totalBalance).toLocaleString('en-IN')}</div>
          </div>
          <HealthRing score={healthScore} />
        </div>
        <CurrentFlowBar {...monthSummary} currency={currency} />
      </div>

      <div className="stat-grid">
        <StatCard label="Income" value={`${currency}${monthSummary.income.toLocaleString('en-IN')}`} accent="income" />
        <StatCard label="Expenses" value={`${currency}${monthSummary.expense.toLocaleString('en-IN')}`} accent="expense" />
        <StatCard label="Savings" value={`${currency}${monthSummary.savings.toLocaleString('en-IN')}`} accent="savings" />
        <StatCard label="Investments" value={`${currency}${monthSummary.investment.toLocaleString('en-IN')}`} accent="invest" />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Top categories this month</h3>
            <span className="panel-sub">From Ledger</span>
          </div>
          <CategoryBars categories={topCategories} currency={currency} />
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Insights</h3></div>
          <InsightList insights={insights} />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Upcoming</h3>
            <Link href="/debts" className="link-btn">View all</Link>
          </div>
          <UpcomingList items={upcoming} currency={currency} />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Goals</h3>
            <Link href="/goals" className="link-btn">View all</Link>
          </div>
          <GoalMiniList goals={goals} currency={currency} />
        </div>
      </div>
    </div>
  );
}
