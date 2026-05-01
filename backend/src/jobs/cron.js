import cron from "node-cron";
import { evaluateAllOpen } from "../services/signal.service.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let task = null;
let lastRun = null;
let lastResult = null;
let running = false;

export function startEvaluatorCron() {
  if (task) return task;
  if (!cron.validate(env.EVALUATOR_CRON)) {
    logger.error(`Invalid EVALUATOR_CRON: ${env.EVALUATOR_CRON}`);
    return null;
  }
  task = cron.schedule(env.EVALUATOR_CRON, async () => {
    if (running) return; // Prevent overlap
    running = true;
    try {
      const result = await evaluateAllOpen();
      lastRun = new Date();
      lastResult = result;
      if (result.transitioned > 0) {
        logger.info(`[CRON] Evaluated ${result.evaluated}, transitioned ${result.transitioned}`);
      }
    } catch (err) {
      logger.error("[CRON] Evaluator failed:", err.message);
    } finally {
      running = false;
    }
  });
  logger.info(`Evaluator cron started: ${env.EVALUATOR_CRON}`);
  return task;
}

export function stopEvaluatorCron() {
  if (task) {
    task.stop();
    task = null;
  }
}

export function getEvaluatorStatus() {
  return {
    schedule: env.EVALUATOR_CRON,
    last_run: lastRun,
    last_result: lastResult,
    running,
  };
}
