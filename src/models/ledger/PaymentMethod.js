import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'other' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PaymentMethodSchema.index({ userId: 1, name: 1 }, { unique: true });

export const DEFAULT_PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Net Banking',
];

export default mongoose.models.PaymentMethod ||
  mongoose.model('PaymentMethod', PaymentMethodSchema);
