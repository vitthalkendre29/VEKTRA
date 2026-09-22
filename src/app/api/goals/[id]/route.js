import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { VektraGoal, VektraTransaction } from '@/models';

export async function DELETE(_req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid goal id.');
    await dbConnect();
    await Promise.all([
      VektraGoal.deleteOne({ _id: id, userId }),
      VektraTransaction.updateMany({ userId, goalId: id }, { $unset: { goalId: 1 } }),
    ]);
    return Response.json({ success: true });
  });
}
