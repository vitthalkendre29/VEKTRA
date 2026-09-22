import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { VektraAccount, VektraTransaction } from '@/models';

export async function PATCH(req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid account id.');
    const body = await req.json().catch(() => ({}));
    await dbConnect();
    const update = {};
    if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim();
    if (typeof body.type === 'string') update.type = body.type;
    const acc = await VektraAccount.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true }).lean();
    if (!acc) return jsonError('Account not found.', 404);
    return Response.json({ id: String(acc._id), name: acc.name, type: acc.type, balance: acc.balance });
  });
}

export async function DELETE(_req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid account id.');
    await dbConnect();
    const inUse = await VektraTransaction.exists({ userId, $or: [{ accountId: id }, { toAccountId: id }] });
    if (inUse) return jsonError('This account has transactions on it — delete those first.', 409);
    await VektraAccount.deleteOne({ _id: id, userId });
    return Response.json({ success: true });
  });
}
