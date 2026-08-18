import mongoose from "mongoose";

export default async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}