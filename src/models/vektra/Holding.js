import mongoose from 'mongoose';

const HoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    invested: { type: Number, default: 0, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    sipAmount: { type: Number, default: 0, min: 0 },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'VektraGoal' },
  },
  { timestamps: true, collection: 'vektra_holdings' }
);

export default mongoose.models.VektraHolding || mongoose.model('VektraHolding', HoldingSchema);
