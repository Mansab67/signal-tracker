import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDB() {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined. Set it in environment variables.");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    logger.error("MongoDB connection failed:");
    logger.error(`  Error: ${err.message}`);
    logger.error(`  Code: ${err.code}`);
    if (err.name === "MongoServerSelectionError") {
      logger.error("  → Check your MONGO_URI format and network access (IP whitelist in Atlas)");
    }
    throw err;
  }

  mongoose.connection.on("error", (err) => logger.error("Mongo error:", err.message));
  mongoose.connection.on("disconnected", () => logger.warn("Mongo disconnected"));
}

export function dbStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}
