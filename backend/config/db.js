import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI);

  try {
    await connectionPromise;
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
