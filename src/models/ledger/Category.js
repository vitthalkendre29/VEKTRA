import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '📦' },
    color: { type: String, default: '#1B6B5B' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const DEFAULT_CATEGORIES = [
  { name: 'Rent', icon: '🏠', color: '#1B6B5B' },
  { name: 'Food & Dining', icon: '🍔', color: '#E0A339' },
  { name: 'Petrol / Fuel', icon: '⛽', color: '#D9634A' },
  { name: 'Vehicle Expenses', icon: '🚗', color: '#5B7BD9' },
  { name: 'Shopping', icon: '🛍️', color: '#C15FBF' },
  { name: 'Bills & Utilities', icon: '💡', color: '#E0A339' },
  { name: 'Entertainment', icon: '🎬', color: '#7A5FC1' },
  { name: 'Health & Medical', icon: '🏥', color: '#D9634A' },
  { name: 'Education', icon: '📚', color: '#2E8C77' },
  { name: 'Travel', icon: '✈️', color: '#3F9BD9' },
  { name: 'Work / Professional', icon: '💼', color: '#4A5B7A' },
  { name: 'Miscellaneous', icon: '📦', color: '#8A8A8A' },
  { name: 'Gifts', icon: '🎁', color: '#6cff00' }
];

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
