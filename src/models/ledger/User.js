import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // absent for OAuth-only users
    profileImage: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    defaultCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    defaultPaymentMethod: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
