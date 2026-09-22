import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    value: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'vektra_assets' }
);

export default mongoose.models.VektraAsset || mongoose.model('VektraAsset', AssetSchema);
