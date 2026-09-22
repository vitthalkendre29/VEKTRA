import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    target: { type: Number, required: true, min: 0 },
    current: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    monthly: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'vektra_goals' }
);

export default mongoose.models.VektraGoal || mongoose.model('VektraGoal', GoalSchema);
