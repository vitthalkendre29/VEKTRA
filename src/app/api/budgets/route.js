import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { Budget, Category, Expense } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ userId }).populate('categoryId', 'name icon color').lean();

    // One aggregation covers "spent so far this month" for every budget
    // category at once, instead of a query per card.
    const spendRows = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    ]);
    const spendByCategory = Object.fromEntries(spendRows.map((r) => [String(r._id), r.total]));

    return Response.json({
      budgets: budgets.map((b) => ({
        id: String(b._id),
        category: b.categoryId?.name || 'Overall',
        categoryId: b.categoryId ? String(b.categoryId._id) : null,
        amount: b.amount,
        period: b.period,
        alertPercent: b.alertPercent || 80,
        spent: (b.categoryId && spendByCategory[String(b.categoryId._id)]) || 0,
      })),
    });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.categoryName) return jsonError('Choose a category.');
    if (!body.amount || Number(body.amount) <= 0) return jsonError('Enter a valid amount.');

    await dbConnect();
    const category = await Category.findOne({ userId, name: body.categoryName });
    if (!category) return jsonError('Category not found in your Ledger account.', 404);

    const budget = await Budget.create({
      userId,
      categoryId: category._id,
      amount: Number(body.amount),
      period: 'monthly',
      startDate: new Date(),
      alertPercent: Number(body.alertPercent) || 80,
    });

    return Response.json({ id: String(budget._id) }, { status: 201 });
  });
}
