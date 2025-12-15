/**
 * db.ts
 * Helper to establish and cache a Mongoose connection to MongoDB.
 * Exports connectDb() which returns a mongoose.Connection and caches
 * the promise/connection to avoid creating multiple connections
 * (useful in serverless/dev hot-reload environments).
 */

import mongoose from "mongoose";

/** MongoDB connection string read from environment. Throws if not provided. */
const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
  throw new Error("db error");
}

/**
 * Cached connection/promise stored on the global object to persist
 * across module reloads. Structure: { connection: mongoose.Connection | null, promise: Promise<mongoose.Connection> | null }
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { connection: null, promise: null };
}

/**
 * Connects to MongoDB using mongoose and caches the resulting connection.
 * - Returns a mongoose.Connection.
 * - Reuses cached connection/promise if available to prevent multiple connections.
 */
const connectDb = async () => {
  if (cached.connection) {
    return cached.connection;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUrl)
      .then((connection) => connection.connection);
  }

  try {
    const connection = await cached.promise;
    return connection;
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
