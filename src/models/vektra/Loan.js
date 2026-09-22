import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    lender: { type: String, default: '' },
    outstanding: { type: Number, default: 0, min: 0 },
    rate: { type: Number, default: 0 },
    emi: { type: Number, default: 0, min: 0 },
    nextPayment: { type: Date },
    reminderDays: { type: Number, default: 3, min: 0, max: 30 },
  },
  { timestamps: true, collection: 'vektra_loans' }
);

export default mongoose.models.VektraLoan || mongoose.model('VektraLoan', LoanSchema);
