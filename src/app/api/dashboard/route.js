import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { withSession } from '@/lib/api-helpers';
import { VektraAccount, VektraTransaction, VektraGoal, VektraLoan, VektraBill, VektraProfile, Budget, Category, Expense } from '@/models';
import { getExpenseFlowRows } from '@/lib/expenses';
import { summarize, categoryBreakdown, insightsFor, healthScore, ESSENTIAL_CATEGORIES, toDateOnly } from '@/lib/calc';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [accounts, thisMonthVektra, prevMonthVektra, thisMonthExpenses, prevMonthExpenses, ledgerAllTimeExpense, goals, loans, bills, budgets, profile] =
      await Promise.all([
        VektraAccount.find({ userId }).lean(),
        VektraTransaction.find({ userId, date: { $gte: monthStart, $lte: monthEnd } }).lean(),
        VektraTransaction.find({ userId, date: { $gte: prevMonthStart, $lte: prevMonthEnd } }).lean(),
        getExpenseFlowRows(userId, { start: monthStart, end: monthEnd }),
        getExpenseFlowRows(userId, { start: prevMonthStart, end: prevMonthEnd }),
        Expense.aggregate([{ $match: { userId: uid } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        VektraGoal.find({ userId }).lean(),
        VektraLoan.find({ userId }).lean(),
        VektraBill.find({ userId }).lean(),
        Budget.find({ userId }).populate('categoryId', 'name').lean(),
        VektraProfile.findOne({ userId }).lean(),
      ]);

    const toFlow = (t) => ({ type: t.type, amount: t.amount, date: toDateOnly(t.date), category: t.category });
    const thisMonthRows = [...thisMonthVektra.map(toFlow), ...thisMonthExpenses];
    const prevMonthRows = [...prevMonthVektra.map(toFlow), ...prevMonthExpenses];

    const monthSummary = summarize(thisMonthRows);
    const ledgerSpendAllTime = ledgerAllTimeExpense[0]?.total || 0;
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0) - ledgerSpendAllTime;

    const topCategories = categoryBreakdown(thisMonthRows, 'expense').slice(0, 5);

    // Budget spend-so-far, for insights.
    const budgetSpendRows = await Expense.aggregate([
      { $match: { userId: uid, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    ]);
    const spendByCatId = Object.fromEntries(budgetSpendRows.map((r) => [String(r._id), r.total]));
    const budgetsShaped = budgets.map((b) => ({
      category: b.categoryId?.name || 'Overall',
      amount: b.amount,
      alertPercent: b.alertPercent,
    }));
    const budgetSpend = Object.fromEntries(
      budgets.map((b) => [b.categoryId?.name || 'Overall', (b.categoryId && spendByCatId[String(b.categoryId._id)]) || 0])
    );

    const insights = insightsFor({ thisMonthRows, prevMonthRows, budgets: budgetsShaped, budgetSpend });

    const emergencyFundCurrent = goals.filter((g) => /emergency/i.test(g.name)).reduce((s, g) => s + (g.current || 0), 0);

    // Average essential-category expense over the last 3 months, straight
    // from Ledger. Two lean queries instead of a $lookup-based aggregation,
    // since $lookup isn't available on every MongoDB-compatible backend.
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const essentialCategoryIds = await (await import('@/models')).Category.find({ userId, name: { $in: ESSENTIAL_CATEGORIES } }).distinct('_id');
    const essentialAgg = essentialCategoryIds.length
      ? await Expense.aggregate([
          { $match: { userId: uid, date: { $gte: threeMonthsAgo, $lte: monthEnd }, categoryId: { $in: essentialCategoryIds } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
      : [];
    const avgMonthlyEssentialExpense = (essentialAgg[0]?.total || 0) / 3;

    const totalMonthlyEMI = loans.reduce((s, l) => s + (l.emi || 0), 0);
    const health = healthScore({
      monthSummary,
      emergencyFundCurrent,
      avgMonthlyEssentialExpense,
      totalMonthlyEMI,
      monthlyIncomeFallback: profile?.monthlyIncome,
    });

    const upcoming = [
      ...bills.map((b) => ({ name: b.name, date: b.dueDate ? toDateOnly(b.dueDate) : null, amount: b.amount, kind: 'bill' })),
      ...loans.map((l) => ({ name: `${l.type} EMI (${l.lender})`, date: l.nextPayment ? toDateOnly(l.nextPayment) : null, amount: l.emi, kind: 'emi' })),
    ]
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .slice(0, 6);

    return Response.json({
      totalBalance,
      healthScore: health,
      monthSummary,
      topCategories,
      insights,
      upcoming,
      debt: loans.reduce((s, l) => s + (l.outstanding || 0), 0),
      goals: goals.slice(0, 4).map((g) => ({ id: String(g._id), name: g.name, target: g.target, current: g.current })),
    });
  });
}
