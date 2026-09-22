import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // null = overall monthly budget
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['monthly'], default: 'monthly' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    // Additive field used by VEKTRA's budget-alert UI. Optional and
    // ignored by anything that doesn't set it, so it's safe on the
    // shared Ledger collection.
    alertPercent: { type: Number, min: 1, max: 100, default: 80 },
  },
  { timestamps: true }
);

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
