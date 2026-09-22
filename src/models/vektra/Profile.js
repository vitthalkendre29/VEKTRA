import mongoose from 'mongoose';

// One document per VEKTRA user, keyed by the Ledger user's own _id — so
// VEKTRA never invents a separate identity. Holds only the extra
// preferences VEKTRA itself needs; name/email/currency-of-record live on
// Ledger's own User document.
const ProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    displayCurrency: { type: String, default: '₹' },
    monthlyIncome: { type: Number, default: 0, min: 0 },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    emergencyFundMonths: { type: Number, default: 6, min: 1 },
  },
  { timestamps: true, collection: 'vektra_profiles' }
);

export default mongoose.models.VektraProfile || mongoose.model('VektraProfile', ProfileSchema);
