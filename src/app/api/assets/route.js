import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraAsset } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const assets = await VektraAsset.find({ userId }).sort({ createdAt: 1 }).lean();
    return Response.json({ assets: assets.map((a) => ({ id: String(a._id), name: a.name, value: a.value })) });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.name) return jsonError('Name is required.');
    await dbConnect();
    const a = await VektraAsset.create({ userId, name: body.name, value: Number(body.value) || 0 });
    return Response.json({ id: String(a._id), name: a.name, value: a.value }, { status: 201 });
  });
}
