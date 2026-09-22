import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraTransaction, VektraAccount, VektraGoal } from '@/models';
import { getExpenseFlowRows } from '@/lib/expenses';

export async function GET(req) {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const accountId = searchParams.get('accountId') || 'all';
    const category = searchParams.get('category') || 'all';
    const q = (searchParams.get('q') || '').toLowerCase();

    const [vektraTxns, expenseRows] = await Promise.all([
      type === 'expense' ? [] : VektraTransaction.find({ userId }).sort({ date: -1 }).lean(),
      type === 'all' || type === 'expense' ? getExpenseFlowRows(userId) : [],
    ]);

    let rows = [
      ...vektraTxns.map((t) => ({
        id: String(t._id),
        type: t.type,
        amount: t.amount,
        date: new Date(t.date).toISOString().slice(0, 10),
        category: t.category || '',
        accountId: t.accountId ? String(t.accountId) : null,
        toAccountId: t.toAccountId ? String(t.toAccountId) : null,
        notes: t.notes || '',
        merchant: t.merchant || '',
        source: 'vektra',
      })),
      ...expenseRows,
    ];

    if (type !== 'all') rows = rows.filter((r) => r.type === type);
    if (accountId !== 'all') rows = rows.filter((r) => r.accountId === accountId);
    if (category !== 'all') rows = rows.filter((r) => r.category === category);
    if (q) rows = rows.filter((r) => (r.notes || '').toLowerCase().includes(q) || (r.merchant || '').toLowerCase().includes(q));

    rows.sort((a, b) => b.date.localeCompare(a.date));

    return Response.json({ transactions: rows });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    const { type, amount, date, category, accountId, toAccountId, goalId, merchant, tags, notes } = body;

    if (!['income', 'transfer', 'investment', 'savings'].includes(type)) {
      return jsonError('Expenses come from Ledger and can\u2019t be added here.');
    }
    if (!amount || Number(amount) <= 0) return jsonError('Enter a valid amount.');
    if (!accountId) return jsonError('Choose an account.');
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      return jsonError('Choose two different accounts.');
    }

    await dbConnect();
    const [account, toAccount] = await Promise.all([
      VektraAccount.findOne({ _id: accountId, userId }),
      toAccountId ? VektraAccount.findOne({ _id: toAccountId, userId }) : null,
    ]);
    if (!account) return jsonError('Account not found.', 404);
    if (type === 'transfer' && !toAccount) return jsonError('Destination account not found.', 404);

    const amt = Number(amount);
    const txn = await VektraTransaction.create({
      userId,
      type,
      amount: amt,
      date: date ? new Date(date) : new Date(),
      category: category || '',
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      goalId: type === 'savings' && goalId ? goalId : undefined,
      merchant: merchant || '',
      tags: tags || '',
      notes: notes || '',
    });

    // Apply the balance effect right on the account documents — a small,
    // targeted write instead of rewriting an entire state blob.
    if (type === 'income') {
      account.balance += amt;
      await account.save();
    } else if (type === 'transfer') {
      account.balance -= amt;
      toAccount.balance += amt;
      await Promise.all([account.save(), toAccount.save()]);
    } else if (type === 'investment') {
      account.balance -= amt;
      await account.save();
    } else if (type === 'savings') {
      account.balance -= amt;
      const ops = [account.save()];
      if (goalId) {
        ops.push(VektraGoal.updateOne({ _id: goalId, userId }, { $inc: { current: amt } }));
      }
      await Promise.all(ops);
    }

    return Response.json({ id: String(txn._id) }, { status: 201 });
  });
}
