import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date },
    frequency: { type: String, enum: ['weekly', 'monthly', 'annual'], default: 'monthly' },
    reminderDays: { type: Number, default: 3, min: 0, max: 30 },
  },
  { timestamps: true, collection: 'vektra_bills' }
);

export default mongoose.models.VektraBill || mongoose.model('VektraBill', BillSchema);
