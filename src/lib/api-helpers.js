import mongoose from 'mongoose';
import { getSession } from './session';

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function withSession(handler) {
  const session = await getSession();
  if (!session) return jsonError('Not authenticated.', 401);
  return handler(session);
}

export function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// VEKTRA's own static category options for the transaction types that
// aren't sourced from Ledger (expenses use Ledger's own categories —
// see /api/categories).
export const VEKTRA_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Interest', 'Dividends', 'Rental', 'Bonus', 'Cashback', 'Refund', 'Other Income'],
  investment: ['Mutual Fund', 'Stocks', 'ETF', 'Fixed Deposit', 'Recurring Deposit', 'PPF', 'EPF', 'NPS', 'Gold', 'Real Estate', 'International', 'Crypto', 'Other'],
  savings: ['Emergency Fund', 'Goal Contribution', 'General Savings'],
  transfer: ['Account Transfer'],
};
