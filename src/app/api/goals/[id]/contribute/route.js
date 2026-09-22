import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { VektraGoal, VektraAccount, VektraTransaction } from '@/models';

export async function POST(req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid goal id.');
    const { amount, accountId } = await req.json().catch(() => ({}));
    if (!amount || Number(amount) <= 0) return jsonError('Enter a valid amount.');
    if (!accountId) return jsonError('Choose an account.');

    await dbConnect();
    const [goal, account] = await Promise.all([
      VektraGoal.findOne({ _id: id, userId }),
      VektraAccount.findOne({ _id: accountId, userId }),
    ]);
    if (!goal) return jsonError('Goal not found.', 404);
    if (!account) return jsonError('Account not found.', 404);

    const amt = Number(amount);
    goal.current += amt;
    account.balance -= amt;
    const txn = VektraTransaction.create({
      userId,
      type: 'savings',
      amount: amt,
      date: new Date(),
      category: 'Goal Contribution',
      accountId,
      goalId: goal._id,
      notes: 'Goal: ' + goal.name,
    });
    await Promise.all([goal.save(), account.save(), txn]);

    return Response.json({ current: goal.current });
  });
}
