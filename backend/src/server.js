import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { startEvaluatorCron, stopEvaluatorCron } from "./jobs/cron.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  await connectDB();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`SignalTracker API listening on :${env.PORT} (${env.NODE_ENV})`);
  });

  startEvaluatorCron();

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down…`);
    stopEvaluatorCron();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("Boot failed:", err);
  process.exit(1);
});
