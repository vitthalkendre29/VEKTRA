import mongoose from 'mongoose';
import { VektraBill, VektraLoan, Budget, Expense } from '@/models';
import { toDateOnly } from './calc';

// What goes into the once-a-day "here's what needs your attention" check:
// bills/EMIs due soon (or overdue) and budgets that have crossed their
// alert threshold this month. Pure read — nothing here marks anything as
// seen; that's a separate, explicit ack (see markAlertsShownToday).
export async function computeDueAlerts(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const today = new Date();
  const todayStr = toDateOnly(today);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [bills, loans, budgets] = await Promise.all([
    VektraBill.find({ userId }).lean(),
    VektraLoan.find({ userId }).lean(),
    Budget.find({ userId }).populate('categoryId', 'name').lean(),
  ]);

  const dueSoon = (dateVal, reminderDays) => {
    if (!dateVal) return null;
    const due = new Date(dateVal);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays > (reminderDays ?? 3)) return null;
    return { diffDays, overdue: diffDays < 0 };
  };

  const bill_items = [];
  for (const b of bills) {
    const hit = dueSoon(b.dueDate, b.reminderDays);
    if (hit) bill_items.push({ kind: 'bill', name: b.name, amount: b.amount, date: b.dueDate ? toDateOnly(b.dueDate) : null, overdue: hit.overdue, diffDays: hit.diffDays });
  }
  for (const l of loans) {
    const hit = dueSoon(l.nextPayment, l.reminderDays);
    if (hit) bill_items.push({ kind: 'emi', name: `${l.type} EMI${l.lender ? ` (${l.lender})` : ''}`, amount: l.emi, date: l.nextPayment ? toDateOnly(l.nextPayment) : null, overdue: hit.overdue, diffDays: hit.diffDays });
  }
  bill_items.sort((a, b) => (a.diffDays ?? 0) - (b.diffDays ?? 0));

  const categoryIds = budgets.map((b) => b.categoryId?._id).filter(Boolean);
  const spendRows = categoryIds.length
    ? await Expense.aggregate([
        { $match: { userId: uid, date: { $gte: monthStart, $lte: monthEnd }, categoryId: { $in: categoryIds } } },
        { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      ])
    : [];
  const spendByCatId = Object.fromEntries(spendRows.map((r) => [String(r._id), r.total]));

  const budget_items = [];
  for (const b of budgets) {
    if (!b.categoryId) continue;
    const spent = spendByCatId[String(b.categoryId._id)] || 0;
    const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    if (pct >= (b.alertPercent || 80)) {
      budget_items.push({ category: b.categoryId.name, spent, amount: b.amount, pct, over: pct >= 100 });
    }
  }
  budget_items.sort((a, b) => b.pct - a.pct);

  return { bills: bill_items, budgets: budget_items, date: todayStr };
}
