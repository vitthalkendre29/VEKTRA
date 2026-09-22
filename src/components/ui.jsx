'use client';

const PALETTE = ['#0F8B8D', '#E85C4A', '#C98A2E', '#6C5CE7', '#1E9E6B', '#5B6178'];

export function StatCard({ label, value, delta, accent }) {
  return (
    <div className={`stat-card ${accent ? `accent-${accent}` : ''}`}>
      <div className="label">{label}</div>
      <div className="value num">{value}</div>
      {delta && <div className={`delta ${delta.dir || ''}`}>{delta.text}</div>}
    </div>
  );
}

export function ProgressBar({ pct }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function CategoryBars({ categories = [], currency = '₹', max }) {
  if (!categories.length) return <EmptyState title="No expenses yet" sub="Once expenses come in from Ledger, they'll show up here." />;
  const top = max ? categories.slice(0, max) : categories;
  const highest = top[0]?.[1] || 1;
  return (
    <div className="cat-list">
      {top.map(([name, amt], i) => (
        <div className="cat-row-full" key={name}>
          <div className="cat-top">
            <span className="cat-name">{name}</span>
            <span className="cat-amt num">{currency}{Math.round(amt).toLocaleString('en-IN')}</span>
          </div>
          <div className="cat-bar-track">
            <div className="cat-bar-fill" style={{ width: `${Math.max(4, (amt / highest) * 100)}%`, background: PALETTE[i % PALETTE.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, sub }) {
  return (
    <div className="empty-state">
      <p>{title}</p>
      {sub && <span>{sub}</span>}
    </div>
  );
}

export function SkeletonBlock({ height = 80 }) {
  return <div className="skeleton" style={{ height, width: '100%' }} />;
}

export function ConfirmDeleteButton({ onConfirm, className = 'row-del', confirmText = "Delete this? This can't be undone." }) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        if (confirm(confirmText)) onConfirm();
      }}
      aria-label="Delete"
    >
      ✕
    </button>
  );
}

export function Badge({ tone = 'ok', children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function TypeChip({ type }) {
  return <span className={`type-chip ${type}`}>{type}</span>;
}

export function HealthRing({ score = 0 }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="health-ring">
      <svg className="ring-svg" viewBox="0 0 120 120">
        <circle className="ring-bg" cx="60" cy="60" r={r} />
        <circle className="ring-fg" cx="60" cy="60" r={r} style={{ strokeDasharray: c, strokeDashoffset: offset }} />
      </svg>
      <div className="ring-label">
        <span>{score}</span>
        <small>Health</small>
      </div>
    </div>
  );
}

const FLOW_CLASS = { expense: 'flow-expense', savings: 'flow-saving', investment: 'flow-invest', remaining: 'flow-remain' };

export function CurrentFlowBar({ income, expense, savings, investment, remaining, currency = '₹' }) {
  const total = Math.max(1, income);
  const segs = [
    { key: 'expense', v: expense },
    { key: 'savings', v: savings },
    { key: 'investment', v: investment },
    { key: 'remaining', v: Math.max(0, remaining) },
  ].filter((s) => s.v > 0);

  return (
    <div>
      <div className="current-flow">
        {segs.map((s) => (
          <div key={s.key} className={`flow-seg ${FLOW_CLASS[s.key]}`} style={{ flexGrow: s.v / total }}>
            <span className="flow-seg-label">{Math.round((s.v / total) * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="current-caption">
        <span>Income <span className="flow-arrow">→</span> {currency}{income.toLocaleString('en-IN')}</span>
        <span>Left over: {currency}{Math.round(remaining).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

export function InsightList({ insights = [] }) {
  if (!insights.length) return <EmptyState title="No insights yet" />;
  return (
    <div className="insight-list">
      {insights.map((ins, i) => (
        <div key={i} className={`insight-item ${ins.kind === 'info' ? '' : ins.kind}`}>{ins.text}</div>
      ))}
    </div>
  );
}

export function UpcomingList({ items = [], currency = '₹' }) {
  if (!items.length) return <EmptyState title="Nothing due soon" />;
  return (
    <div className="upcoming-list">
      {items.map((u, i) => (
        <div className="upcoming-row" key={i}>
          <div>
            <span className="u-name">{u.name}</span>
            <span className="u-date">{u.date ? new Date(u.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'No date set'}</span>
          </div>
          <span className="u-amt num">{currency}{u.amount?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
}

export function GoalMiniList({ goals = [], currency = '₹' }) {
  if (!goals.length) return <EmptyState title="No goals yet" sub="Add one from the Goals & Savings view." />;
  return (
    <div className="goal-mini-list">
      {goals.map((g) => {
        const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
        return (
          <div className="goal-mini" key={g.id}>
            <div className="g-top">
              <strong>{g.name}</strong>
              <span className="g-pct">{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
