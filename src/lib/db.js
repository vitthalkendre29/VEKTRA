import mongoose from 'mongoose';

// Next.js reloads modules in dev, so the connection promise is cached on
// `global` to survive hot-reloads instead of opening a new pool every time.
let cached = global._vektraMongoose;
if (!cached) cached = global._vektraMongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in .env — copy .env.example to .env and fill it in.');
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 20, // pooled + reused across all API routes/requests
        bufferCommands: false,
      })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
