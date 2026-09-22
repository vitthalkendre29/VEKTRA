import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraGoal } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const goals = await VektraGoal.find({ userId }).sort({ createdAt: 1 }).lean();
    return Response.json({ goals: goals.map(shape) });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.name || !body.target) return jsonError('Name and target amount are required.');
    await dbConnect();
    const goal = await VektraGoal.create({
      userId,
      name: String(body.name).trim(),
      target: Number(body.target),
      current: Number(body.current) || 0,
      targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      priority: body.priority || 'Medium',
      monthly: Number(body.monthly) || 0,
    });
    return Response.json(shape(goal.toObject()), { status: 201 });
  });
}

export function shape(g) {
  return {
    id: String(g._id),
    name: g.name,
    target: g.target,
    current: g.current,
    targetDate: g.targetDate ? new Date(g.targetDate).toISOString().slice(0, 10) : null,
    priority: g.priority,
    monthly: g.monthly,
  };
}
