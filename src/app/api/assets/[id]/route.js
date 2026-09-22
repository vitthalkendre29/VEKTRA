import { dbConnect } from '@/lib/db';
import { withSession, jsonError, isValidId } from '@/lib/api-helpers';
import { VektraAsset } from '@/models';

export async function DELETE(_req, { params }) {
  return withSession(async ({ userId }) => {
    const { id } = await params;
    if (!isValidId(id)) return jsonError('Invalid asset id.');
    await dbConnect();
    await VektraAsset.deleteOne({ _id: id, userId });
    return Response.json({ success: true });
  });
}
