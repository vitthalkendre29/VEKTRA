import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { VektraTransaction, VektraAccount, VektraGoal } from '@/models';

export async function DELETE(_req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid transaction id.');
    await dbConnect();
    const txn = await VektraTransaction.findOne({ _id: id, userId });
    if (!txn) return jsonError('Transaction not found.', 404);

    // Reverse the balance effect before deleting, same logic as applying
    // it, with the sign flipped.
    const amt = txn.amount;
    const ops = [];
    if (txn.type === 'income') {
      ops.push(VektraAccount.updateOne({ _id: txn.accountId, userId }, { $inc: { balance: -amt } }));
    } else if (txn.type === 'transfer') {
      ops.push(VektraAccount.updateOne({ _id: txn.accountId, userId }, { $inc: { balance: amt } }));
      ops.push(VektraAccount.updateOne({ _id: txn.toAccountId, userId }, { $inc: { balance: -amt } }));
    } else if (txn.type === 'investment') {
      ops.push(VektraAccount.updateOne({ _id: txn.accountId, userId }, { $inc: { balance: amt } }));
    } else if (txn.type === 'savings') {
      ops.push(VektraAccount.updateOne({ _id: txn.accountId, userId }, { $inc: { balance: amt } }));
      if (txn.goalId) ops.push(VektraGoal.updateOne({ _id: txn.goalId, userId }, { $inc: { current: -amt } }));
    }
    ops.push(VektraTransaction.deleteOne({ _id: id, userId }));
    await Promise.all(ops);

    return Response.json({ success: true });
  });
}
