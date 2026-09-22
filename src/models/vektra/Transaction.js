import mongoose from 'mongoose';

// Only income / transfer / investment / savings live here. Expenses are
// never duplicated into VEKTRA's own storage — the Transactions view
// reads them live from Ledger's own Expense collection and merges them
// in at query time (see /api/transactions).
const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'transfer', 'investment', 'savings'], required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    category: { type: String, default: '' },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'VektraAccount', required: true },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'VektraAccount' },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'VektraGoal' },
    merchant: { type: String, default: '' },
    tags: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true, collection: 'vektra_transactions' }
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });

export default mongoose.models.VektraTransaction || mongoose.model('VektraTransaction', TransactionSchema);
