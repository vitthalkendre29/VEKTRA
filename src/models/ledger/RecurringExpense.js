import mongoose from 'mongoose';

const RecurringExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, default: '' },
    active: { type: Boolean, default: true },
    lastGeneratedDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.RecurringExpense ||
  mongoose.model('RecurringExpense', RecurringExpenseSchema);
