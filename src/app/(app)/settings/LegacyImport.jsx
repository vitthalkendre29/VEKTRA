'use client';

import { useState } from 'react';
import { post } from '@/lib/fetcher';
import { useToast } from '@/components/UIProvider';

// Recreates data from an old VEKTRA (pre-Next.js) JSON export, which
// stored everything as flat arrays under a single state blob. Expense
// entries in that old export are skipped on purpose — expenses are no
// longer duplicated into VEKTRA's own storage; they always come live
// from Ledger, so nothing needs importing for them here.
export default function LegacyImport() {
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);
  const toast = useToast();

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setSummary(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const state = parsed.state || parsed;

      const accountIdMap = {};
      const goalIdMap = {};
      const counts = { accounts: 0, goals: 0, transactions: 0, budgets: 0, holdings: 0, loans: 0, bills: 0, assets: 0, liabilities: 0, skipped: 0 };

      for (const a of state.accounts || []) {
        try {
          const created = await post('/api/accounts', { name: a.name, type: a.type, balance: 0 });
          accountIdMap[a.id] = created.id;
          counts.accounts++;
        } catch { counts.skipped++; }
      }
      for (const g of state.goals || []) {
        try {
          const created = await post('/api/goals', { name: g.name, target: g.target, current: g.current, targetDate: g.targetDate, priority: g.priority, monthly: g.monthly });
          goalIdMap[g.id] = created.id;
          counts.goals++;
        } catch { counts.skipped++; }
      }
      for (const t of state.transactions || []) {
        if (t.type === 'expense') { counts.skipped++; continue; }
        if (!['income', 'transfer', 'investment', 'savings'].includes(t.type)) { counts.skipped++; continue; }
        const accountId = accountIdMap[t.accountId];
        if (!accountId) { counts.skipped++; continue; }
        try {
          await post('/api/transactions', {
            type: t.type, amount: t.amount, date: t.date, category: t.category,
            accountId, toAccountId: t.toAccountId ? accountIdMap[t.toAccountId] : undefined,
            goalId: t.goalId ? goalIdMap[t.goalId] : undefined,
            merchant: t.merchant, notes: t.notes,
          });
          counts.transactions++;
        } catch { counts.skipped++; }
      }
      for (const b of state.budgets || []) {
        try { await post('/api/budgets', { categoryName: b.category, amount: b.amount, alertPercent: b.alertPercent || 80 }); counts.budgets++; }
        catch { counts.skipped++; }
      }
      for (const h of state.holdings || []) {
        try { await post('/api/holdings', { name: h.name, type: h.type, invested: h.invested, currentValue: h.currentValue, sipAmount: h.sipAmount }); counts.holdings++; }
        catch { counts.skipped++; }
      }
      for (const l of state.loans || []) {
        try { await post('/api/loans', { type: l.type, lender: l.lender, outstanding: l.outstanding, rate: l.rate, emi: l.emi, nextPayment: l.nextPayment, reminderDays: l.reminderDays }); counts.loans++; }
        catch { counts.skipped++; }
      }
      for (const b of state.bills || []) {
        try { await post('/api/bills', { name: b.name, amount: b.amount, dueDate: b.dueDate, frequency: b.frequency, reminderDays: b.reminderDays }); counts.bills++; }
        catch { counts.skipped++; }
      }
      for (const a of state.assets || []) {
        try { await post('/api/assets', { name: a.name, value: a.value }); counts.assets++; }
        catch { counts.skipped++; }
      }
      for (const l of state.liabilities || []) {
        try { await post('/api/liabilities', { name: l.name, value: l.value }); counts.liabilities++; }
        catch { counts.skipped++; }
      }

      setSummary(counts);
      toast('Import finished');
    } catch (err) {
      toast('Could not read that file');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-head"><h3>Import old VEKTRA backup</h3></div>
      <p className="muted" style={{ marginBottom: 14 }}>
        Have a JSON export from the old version of VEKTRA? Bring your accounts, goals, holdings, loans, bills and manual transactions across.
        Expenses aren&rsquo;t part of this — they already live in Ledger.
      </p>
      <label className="file-btn btn-secondary">
        {busy ? 'Importing…' : 'Choose file'}
        <input type="file" accept="application/json" onChange={onFile} disabled={busy} style={{ display: 'none' }} />
      </label>
      {summary && (
        <p className="inline-note" style={{ marginTop: 12 }}>
          Imported {summary.accounts} accounts, {summary.goals} goals, {summary.transactions} transactions, {summary.budgets} budgets, {summary.holdings} holdings, {summary.loans} loans, {summary.bills} bills, {summary.assets} assets, {summary.liabilities} liabilities.
          {summary.skipped > 0 && ` Skipped ${summary.skipped} entries that couldn't be matched.`}
        </p>
      )}
    </div>
  );
}
