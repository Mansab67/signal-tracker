import dotenv from "dotenv";
dotenv.config();

// Validate required env vars
const required = ["MONGO_URI"];
for (const key of required) {
  const val = process.env[key];
  if (!val || (typeof val === "string" && val.trim() === "")) {
    console.error(`[env] Missing required env var: ${key}`);
    console.error(`[env] Set ${key} in your deployment environment (e.g., Render dashboard)`);
    process.exit(1);
  }
}

// Validate PORT
const rawPort = process.env.PORT || "4000";
const port = parseInt(rawPort, 10);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error(`[env] Invalid PORT: ${rawPort}. Must be 0-65535.`);
  process.exit(1);
}

// Validate MONGO_URI format (basic check)
const mongoUri = process.env.MONGO_URI;
if (mongoUri && !mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
  console.error(`[env] Invalid MONGO_URI format. Must start with "mongodb://" or "mongodb+srv://"`);
  console.error(`[env] Received: ${mongoUri.substring(0, 50)}...`);
  process.exit(1);
}

export const env = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: mongoUri,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  EVALUATOR_CRON: process.env.EVALUATOR_CRON || "*/30 * * * * *",
  BINANCE_BASE_URL: process.env.BINANCE_BASE_URL || "https://api.binance.com",
};
