import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { VektraBill } from '@/models';

export async function DELETE(_req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid bill id.');
    await dbConnect();
    await VektraBill.deleteOne({ _id: id, userId });
    return Response.json({ success: true });
  });
}
