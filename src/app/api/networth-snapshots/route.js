import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { withSession } from '@/lib/api-helpers';
import { VektraNetWorthSnapshot, VektraAccount, VektraHolding, VektraAsset, VektraLiability, VektraLoan, Expense } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const snaps = await VektraNetWorthSnapshot.find({ userId }).sort({ date: 1 }).lean();
    return Response.json({ snapshots: snaps.map((s) => ({ id: String(s._id), date: new Date(s.date).toISOString().slice(0, 10), value: s.value })) });
  });
}

export async function POST() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const uid = new mongoose.Types.ObjectId(userId);
    const [accounts, holdings, assets, liabilities, loans, ledgerTotal] = await Promise.all([
      VektraAccount.find({ userId }).lean(),
      VektraHolding.find({ userId }).lean(),
      VektraAsset.find({ userId }).lean(),
      VektraLiability.find({ userId }).lean(),
      VektraLoan.find({ userId }).lean(),
      Expense.aggregate([{ $match: { userId: uid } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    const accountsTotal = accounts.reduce((s, a) => s + (a.balance || 0), 0) - (ledgerTotal[0]?.total || 0);
    const investTotal = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
    const manualAssets = assets.reduce((s, a) => s + (a.value || 0), 0);
    const manualLiab = liabilities.reduce((s, l) => s + (l.value || 0), 0);
    const loanTotal = loans.reduce((s, l) => s + (l.outstanding || 0), 0);
    const value = accountsTotal + investTotal + manualAssets - (loanTotal + manualLiab);

    const snap = await VektraNetWorthSnapshot.create({ userId, date: new Date(), value });
    return Response.json({ id: String(snap._id), date: new Date(snap.date).toISOString().slice(0, 10), value: snap.value }, { status: 201 });
  });
}
