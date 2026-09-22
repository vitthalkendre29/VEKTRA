import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraLiability } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const liabilities = await VektraLiability.find({ userId }).sort({ createdAt: 1 }).lean();
    return Response.json({ liabilities: liabilities.map((l) => ({ id: String(l._id), name: l.name, value: l.value })) });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.name) return jsonError('Name is required.');
    await dbConnect();
    const l = await VektraLiability.create({ userId, name: body.name, value: Number(body.value) || 0 });
    return Response.json({ id: String(l._id), name: l.name, value: l.value }, { status: 201 });
  });
}
