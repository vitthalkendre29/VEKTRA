import { dbConnect } from '@/lib/db';
import { withSession, VEKTRA_CATEGORIES } from '@/lib/api-helpers';
import { getUserCategories } from '@/lib/expenses';

// Ledger's own categories (read-only) plus VEKTRA's static lists for the
// transaction types Ledger doesn't cover.
export async function GET() {
  return withSession(async ({ userId }) => {
    await dbConnect();
    const ledger = await getUserCategories(userId);
    return Response.json({
      ledger: ledger.map((c) => ({ name: c.name, icon: c.icon, color: c.color })),
      vektra: VEKTRA_CATEGORIES,
    });
  });
}
