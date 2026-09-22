import { dbConnect } from '@/lib/db';
import { withSession } from '@/lib/api-helpers';
import { VektraTransaction } from '@/models';
import { getExpenseFlowRows } from '@/lib/expenses';
import { summarize, categoryBreakdown, periodRange, toDateOnly } from '@/lib/calc';

export async function GET(req) {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'month';
    const offset = Number(searchParams.get('offset')) || 0;
    const { start, end, label } = periodRange(type, Math.min(0, offset));

    const [vektraTxns, expenseRows] = await Promise.all([
      VektraTransaction.find({ userId, date: { $gte: start, $lte: end } }).lean(),
      getExpenseFlowRows(userId, { start, end }),
    ]);

    const rows = [
      ...vektraTxns.map((t) => ({ type: t.type, amount: t.amount, date: toDateOnly(t.date), category: t.category })),
      ...expenseRows,
    ];

    const summary = summarize(rows);
    const categories = categoryBreakdown(rows, 'expense');

    return Response.json({ label, offset: Math.min(0, offset), ...summary, categories });
  });
}
