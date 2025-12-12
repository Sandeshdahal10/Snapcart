import mongoose, { Mongoose } from "mongoose";

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
  throw new Error("db error");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { connection: null, promise: null };
}

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
