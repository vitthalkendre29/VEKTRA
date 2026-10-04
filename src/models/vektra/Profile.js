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
    // 'YYYY-MM-DD' of the last day the due-bills/over-budget alert was
    // shown. Server-side (not localStorage) so it's once-per-day across
    // every device the user opens VEKTRA on, not once per browser.
    lastAlertShownDate: { type: String, default: null },
  },
  { timestamps: true, collection: 'vektra_profiles' }
);

export default mongoose.models.VektraProfile || mongoose.model('VektraProfile', ProfileSchema);
