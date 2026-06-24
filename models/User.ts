import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['generator', 'collector'], required: true },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  swarajPoints: { type: Number, default: 0 }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);