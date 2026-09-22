import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['bank', 'cash', 'wallet', 'credit_card', 'investment', 'other'], default: 'other' },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'vektra_accounts' }
);

AccountSchema.index({ userId: 1, name: 1 });

export default mongoose.models.VektraAccount || mongoose.model('VektraAccount', AccountSchema);
