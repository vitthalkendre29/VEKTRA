import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraBill } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const bills = await VektraBill.find({ userId }).sort({ dueDate: 1 }).lean();
    return Response.json({ bills: bills.map(shape) });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.name || !String(body.name).trim()) return jsonError('Name is required.');
    await dbConnect();
    const b = await VektraBill.create({
      userId,
      name: String(body.name).trim(),
      amount: Number(body.amount) || 0,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      frequency: body.frequency || 'monthly',
      reminderDays: Number(body.reminderDays) || 3,
    });
    return Response.json(shape(b.toObject()), { status: 201 });
  });
}

function shape(b) {
  return { id: String(b._id), name: b.name, amount: b.amount, dueDate: b.dueDate ? new Date(b.dueDate).toISOString().slice(0, 10) : null, frequency: b.frequency, reminderDays: b.reminderDays };
}
