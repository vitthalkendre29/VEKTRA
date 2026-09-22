import mongoose from 'mongoose';

const NetWorthSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    value: { type: Number, required: true },
  },
  { timestamps: true, collection: 'vektra_networth_snapshots' }
);

NetWorthSnapshotSchema.index({ userId: 1, date: 1 });

export default mongoose.models.VektraNetWorthSnapshot ||
  mongoose.model('VektraNetWorthSnapshot', NetWorthSnapshotSchema);
