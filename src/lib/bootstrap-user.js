import { dbConnect } from './db';
import { Category, PaymentMethod, VektraProfile, VektraAccount, VektraGoal } from '@/models';
import { DEFAULT_CATEGORIES } from '@/models/ledger/Category';
import { DEFAULT_PAYMENT_METHODS } from '@/models/ledger/PaymentMethod';

// Runs once, the first time a given Ledger user logs into VEKTRA. Seeds
// only what's actually missing, so it's safe to call on every login.
export async function ensureUserBootstrapped(userId) {
  await dbConnect();

  const [profile, accountCount, goalCount, catCount, pmCount] = await Promise.all([
    VektraProfile.findOne({ userId }),
    VektraAccount.countDocuments({ userId }),
    VektraGoal.countDocuments({ userId }),
    Category.countDocuments({ userId }),
    PaymentMethod.countDocuments({ userId }),
  ]);

  const ops = [];

  if (!profile) ops.push(VektraProfile.create({ userId }));

  if (accountCount === 0) {
    ops.push(VektraAccount.create({ userId, name: 'Cash', type: 'cash', balance: 0 }));
  }

  if (goalCount === 0) {
    ops.push(
      VektraGoal.insertMany([
        { userId, name: 'Emergency Fund 1', target: 20000, current: 0, priority: 'High', monthly: 0 },
        { userId, name: 'Emergency Fund 2', target: 30000, current: 0, priority: 'High', monthly: 0 },
      ])
    );
  }

  // Ledger categories/payment methods only get seeded if the Ledger
  // account genuinely has none yet — VEKTRA never overwrites a user's
  // existing Ledger data, it only fills a first-time gap.
  if (catCount === 0) {
    ops.push(
      Category.insertMany(
        DEFAULT_CATEGORIES.map((c, i) => ({ userId, ...c, isDefault: i === 0 }))
      )
    );
  }
  if (pmCount === 0) {
    ops.push(
      PaymentMethod.insertMany(
        DEFAULT_PAYMENT_METHODS.map((name, i) => ({ userId, name, type: 'other', isDefault: i === 0 }))
      )
    );
  }

  if (ops.length) await Promise.all(ops);
}
