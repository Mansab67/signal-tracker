import dotenv from "dotenv";
dotenv.config();

const required = ["MONGO_URI"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[env] Missing required env var: ${key}`);
    process.exit(1);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  EVALUATOR_CRON: process.env.EVALUATOR_CRON || "*/30 * * * * *",
  BINANCE_BASE_URL: process.env.BINANCE_BASE_URL || "https://api.binance.com",
};
