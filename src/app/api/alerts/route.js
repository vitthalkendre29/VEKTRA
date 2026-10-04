import { dbConnect } from '@/lib/db';
import { withSession } from '@/lib/api-helpers';
import { VektraProfile } from '@/models';
import { computeDueAlerts } from '@/lib/alerts';

export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const [alerts, profile] = await Promise.all([
      computeDueAlerts(userId),
      VektraProfile.findOne({ userId }).select('lastAlertShownDate').lean(),
    ]);
    const shownToday = profile?.lastAlertShownDate === alerts.date;
    return Response.json({ ...alerts, shownToday });
  });
}

// Called once the alert has actually been shown to the user (not on
// every GET) — marks today as done so it won't pop again until tomorrow,
// on this account, on any device.
export async function POST() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const today = new Date().toISOString().slice(0, 10);
    await VektraProfile.findOneAndUpdate({ userId }, { $set: { lastAlertShownDate: today } }, { upsert: true });
    return Response.json({ success: true });
  });
}
