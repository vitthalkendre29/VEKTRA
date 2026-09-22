// Pure calculation helpers shared by the summary/analytics API routes.
// Operate on a flat array of "flow" rows: { type, amount, date, category }
// where date is a 'YYYY-MM-DD' string and type is one of
// income | expense | transfer | investment | savings.

export function monthKeyOf(dateStr) {
  return dateStr.slice(0, 7);
}

export function sumByType(rows, type) {
  return rows.filter((r) => r.type === type).reduce((s, r) => s + (Number(r.amount) || 0), 0);
}

export function summarize(rows) {
  const income = sumByType(rows, 'income');
  const expense = sumByType(rows, 'expense');
  const savings = sumByType(rows, 'savings');
  const investment = sumByType(rows, 'investment');
  const remaining = income - expense - savings - investment;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const investRate = income > 0 ? Math.round((investment / income) * 100) : 0;
  return { income, expense, savings, investment, remaining, savingsRate, investRate, count: rows.length };
}

export function categoryBreakdown(rows, type = 'expense') {
  const map = {};
  rows
    .filter((r) => r.type === type)
    .forEach((r) => {
      map[r.category || 'Other'] = (map[r.category || 'Other'] || 0) + (Number(r.amount) || 0);
    });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

// type: 'month' | 'quarter' | 'year'. offset 0 = current period, negative
// = that many periods back. Mirrors the original client-side navigator so
// the Analytics view's Prev/Next behavior is unchanged.
export function periodRange(type, offset = 0, now = new Date()) {
  if (type === 'quarter') {
    const totalMonths = now.getFullYear() * 12 + now.getMonth() + offset * 3;
    const y = Math.floor(totalMonths / 12);
    const q = Math.floor((totalMonths % 12) / 3);
    const start = new Date(y, q * 3, 1);
    const end = new Date(y, q * 3 + 3, 0, 23, 59, 59, 999);
    return { start, end, label: `Q${q + 1} ${y}` };
  }
  if (type === 'year') {
    const y = now.getFullYear() + offset;
    return { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59, 999), label: String(y) };
  }
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end, label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) };
}

export function insightsFor({ thisMonthRows, prevMonthRows, budgets, budgetSpend }) {
  const out = [];
  const cur = summarize(thisMonthRows);
  const prev = summarize(prevMonthRows);

  if (prev.expense > 0) {
    const diff = Math.round(((cur.expense - prev.expense) / prev.expense) * 100);
    if (Math.abs(diff) >= 5) {
      out.push({ text: `Expenses are ${diff > 0 ? 'up' : 'down'} ${Math.abs(diff)}% vs last month.`, kind: diff > 0 ? 'warn' : 'good' });
    }
  }
  if (prev.savingsRate > 0 && cur.savingsRate !== prev.savingsRate) {
    out.push({
      text: `Savings rate moved from ${prev.savingsRate}% to ${cur.savingsRate}%.`,
      kind: cur.savingsRate >= prev.savingsRate ? 'good' : 'warn',
    });
  }
  const cats = categoryBreakdown(thisMonthRows, 'expense');
  if (cats.length) {
    out.push({ text: `Your biggest expense category this month is ${cats[0][0]}.`, kind: 'info' });
  }
  (budgets || []).forEach((b) => {
    const spentAmt = budgetSpend?.[b.category] || 0;
    const pct = b.amount > 0 ? Math.round((spentAmt / b.amount) * 100) : 0;
    if (pct >= (b.alertPercent || 80)) out.push({ text: `Your ${b.category} budget is ${pct}% used.`, kind: 'warn' });
  });
  if (cur.income > 0 && cur.remaining < 0) {
    out.push({ text: `You've spent, saved and invested more than you earned this month.`, kind: 'warn' });
  }
  if (!out.length) out.push({ text: `Add a few transactions to start seeing personalized insights.`, kind: 'info' });
  return out;
}

export function healthScore({ monthSummary, emergencyFundCurrent, avgMonthlyEssentialExpense, totalMonthlyEMI, monthlyIncomeFallback }) {
  let score = 0;
  score += Math.min(25, monthSummary.savingsRate * 0.8);
  score += Math.min(25, monthSummary.investRate * 0.9);
  const essential = avgMonthlyEssentialExpense || 1;
  const coverage = emergencyFundCurrent / essential;
  score += Math.min(25, (coverage / 6) * 25);
  const income = monthSummary.income || monthlyIncomeFallback || 1;
  const dti = totalMonthlyEMI / income;
  score += Math.max(0, 25 - dti * 100);
  return Math.round(Math.max(0, Math.min(100, score)));
}

export const ESSENTIAL_CATEGORIES = ['Rent', 'Maintenance', 'Electricity', 'Water', 'Gas', 'Internet', 'Groceries', 'EMI', 'Insurance', 'Medicine'];

export function toDateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}
