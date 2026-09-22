import mongoose from 'mongoose';

const LiabilitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    value: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'vektra_liabilities' }
);

export default mongoose.models.VektraLiability || mongoose.model('VektraLiability', LiabilitySchema);
