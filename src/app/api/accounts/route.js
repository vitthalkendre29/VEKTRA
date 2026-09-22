import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraAccount, Expense } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const [accounts, ledgerTotal] = await Promise.all([
      VektraAccount.find({ userId }).sort({ createdAt: 1 }).lean(),
      Expense.aggregate([{ $match: { userId: idMatch(userId) } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    const ledgerSpend = ledgerTotal[0]?.total || 0;
    // A read-only virtual row representing money spent through Ledger —
    // shown for context, never stored, never editable here.
    const virtual = { id: 'ledger-virtual', name: 'Ledger Spending', type: 'linked', balance: -ledgerSpend, virtual: true };
    return Response.json({
      accounts: accounts.map(shape).concat(virtual),
    });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.name || !String(body.name).trim()) return jsonError('Account name is required.');
    await dbConnect();
    const acc = await VektraAccount.create({
      userId,
      name: String(body.name).trim(),
      type: body.type || 'other',
      balance: Number(body.balance) || 0,
    });
    return Response.json(shape(acc.toObject()), { status: 201 });
  });
}

function shape(a) {
  return { id: String(a._id), name: a.name, type: a.type, balance: a.balance };
}

function idMatch(userId) {
  return new mongoose.Types.ObjectId(userId);
}
