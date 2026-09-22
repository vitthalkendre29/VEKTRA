import { Expense, Category } from '@/models';

// Reads live from Ledger's own Expense collection (read-only, never
// written to) and shapes rows to match VEKTRA's flow-row format. Nothing
// here is ever copied into VEKTRA's own storage — this always reflects
// the current state of the user's Ledger account.
export async function getExpenseFlowRows(userId, { start, end } = {}) {
  const query = { userId };
  if (start || end) {
    query.date = {};
    if (start) query.date.$gte = start;
    if (end) query.date.$lte = end;
  }
  const expenses = await Expense.find(query).sort({ date: -1 }).populate('categoryId', 'name icon color').lean();
  return expenses.map((e) => ({
    id: String(e._id),
    type: 'expense',
    amount: e.amount,
    date: new Date(e.date).toISOString().slice(0, 10),
    category: e.categoryId?.name || 'Other',
    categoryIcon: e.categoryId?.icon || '',
    notes: e.description || '',
    merchant: e.location || '',
    source: 'ledger',
  }));
}

export async function getUserCategories(userId) {
  return Category.find({ userId }).sort({ isDefault: -1, name: 1 }).select('name icon color').lean();
}
