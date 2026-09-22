import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraHolding } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const holdings = await VektraHolding.find({ userId }).sort({ createdAt: 1 }).lean();
    return Response.json({ holdings: holdings.map(shape) });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.name || !String(body.name).trim()) return jsonError('Name is required.');
    await dbConnect();
    const h = await VektraHolding.create({
      userId,
      name: String(body.name).trim(),
      type: body.type || 'Other',
      invested: Number(body.invested) || 0,
      currentValue: Number(body.currentValue) || 0,
      sipAmount: Number(body.sipAmount) || 0,
      goalId: body.goalId || undefined,
    });
    return Response.json(shape(h.toObject()), { status: 201 });
  });
}

function shape(h) {
  return { id: String(h._id), name: h.name, type: h.type, invested: h.invested, currentValue: h.currentValue, sipAmount: h.sipAmount, goalId: h.goalId ? String(h.goalId) : null };
}
