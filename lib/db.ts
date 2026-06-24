import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Check karein ye naam .env se match kare

export const connectToDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing! Check your .env.local file.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};