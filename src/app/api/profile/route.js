import { dbConnect } from '@/lib/db';
import { withSession, jsonError } from '@/lib/api-helpers';
import { User, VektraProfile } from '@/models';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const [user, profile] = await Promise.all([
      User.findById(userId).select('name email').lean(),
      VektraProfile.findOne({ userId }).lean(),
    ]);
    if (!user) return jsonError('User not found.', 404);
    return Response.json({
      name: user.name,
      email: user.email,
      currency: profile?.displayCurrency || '₹',
      monthlyIncome: profile?.monthlyIncome || 0,
      theme: profile?.theme || 'light',
      emergencyFundMonths: profile?.emergencyFundMonths || 6,
    });
  });
}

export async function PUT(req) {
  return withSession(async ({ userId }) => {
    const body = await req.json().catch(() => ({}));
    await dbConnect();
    const update = {};
    if (typeof body.currency === 'string') update.displayCurrency = body.currency;
    if (Number.isFinite(body.monthlyIncome)) update.monthlyIncome = Math.max(0, body.monthlyIncome);
    if (body.theme === 'light' || body.theme === 'dark') update.theme = body.theme;
    if (Number.isFinite(body.emergencyFundMonths)) update.emergencyFundMonths = Math.max(1, body.emergencyFundMonths);

    const profile = await VektraProfile.findOneAndUpdate(
      { userId },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    return Response.json({
      currency: profile.displayCurrency,
      monthlyIncome: profile.monthlyIncome,
      theme: profile.theme,
      emergencyFundMonths: profile.emergencyFundMonths,
    });
  });
}
