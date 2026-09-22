import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { Budget } from '@/models';

export async function DELETE(_req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid budget id.');
    await dbConnect();
    await Budget.deleteOne({ _id: id, userId });
    return Response.json({ success: true });
  });
}
