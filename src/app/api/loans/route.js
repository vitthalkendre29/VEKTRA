import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { VektraLoan } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const loans = await VektraLoan.find({ userId }).sort({ createdAt: 1 }).lean();
    return Response.json({ loans: loans.map(shape) });
  });
}

export async function POST(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    if (!body.type) return jsonError('Loan type is required.');
    await dbConnect();
    const l = await VektraLoan.create({
      userId,
      type: body.type,
      lender: body.lender || '',
      outstanding: Number(body.outstanding) || 0,
      rate: Number(body.rate) || 0,
      emi: Number(body.emi) || 0,
      nextPayment: body.nextPayment ? new Date(body.nextPayment) : undefined,
      reminderDays: Number(body.reminderDays) || 3,
    });
    return Response.json(shape(l.toObject()), { status: 201 });
  });
}

function shape(l) {
  return { id: String(l._id), type: l.type, lender: l.lender, outstanding: l.outstanding, rate: l.rate, emi: l.emi, nextPayment: l.nextPayment ? new Date(l.nextPayment).toISOString().slice(0, 10) : null, reminderDays: l.reminderDays };
}
