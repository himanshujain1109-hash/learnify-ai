import mongoose from "mongoose";

// Cache the connection promise (not just the connection) so that concurrent
// requests arriving before Mongo finishes connecting all await the SAME
// promise instead of each calling mongoose.connect() again. Calling
// mongoose.connect() a second time while the first call is still pending
// throws "Can't call openUri() on an active connection with different
// connection strings" / silently races — a common cause of intermittent
// "registration fails" errors under load or on cold starts.
let connectionPromise = null;

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw Object.assign(
      new Error("Server misconfiguration: MONGODB_URI is not set."),
      { statusCode: 500 }
    );
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        // Reset so the next request can retry instead of being stuck
        // forever on a rejected cached promise.
        connectionPromise = null;
        throw Object.assign(
          new Error(`Database connection failed: ${err.message}`),
          { statusCode: 503 }
        );
      });
  }

  return connectionPromise;
}