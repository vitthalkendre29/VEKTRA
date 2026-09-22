import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: true }, // date+time combined, stored as UTC instant
    paymentMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
    description: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    receiptUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    isRecurring: { type: Boolean, default: false },
    recurringExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringExpense' },
  },
  { timestamps: true }
);

// Compound indexes covering the app's most common analytics/query patterns.
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, categoryId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, paymentMethodId: 1 });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
