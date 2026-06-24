import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  wasteType: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, default: 'kg' },
  description: { type: String },
  status: { type: String, enum: ['pending', 'assigned', 'completed'], default: 'pending' },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  assignedCollectorId: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  
  // New fields
  itemType: { type: String, enum: ['waste', 'old_item'], required: true },
  wasteCategory: { type: String },
  imageUrl: { type: String },
  price: { type: Number }
});

// To fix Next.js hot reloading duplicate model error
export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
