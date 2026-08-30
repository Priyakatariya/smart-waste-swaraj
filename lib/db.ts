import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectToDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment variables.");
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    throw new Error("Failed to connect to MongoDB: " + (err as Error).message);
  }
};