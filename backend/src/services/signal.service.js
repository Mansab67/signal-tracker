import { Signal, SIGNAL_STATUS } from "../models/Signal.js";
import { getPrice, getPrices, symbolExists } from "./binance.service.js";
import { evaluateTransition, computeRoi } from "./evaluator.service.js";
import { logger } from "../utils/logger.js";

/** Create a new signal — assumes input has passed validator already. */
export async function createSignal(input) {
  const symbol = input.symbol.toUpperCase();
  const exists = await symbolExists(symbol);
  if (!exists) {
    const err = new Error(`Symbol ${symbol} not found on Binance`);
    err.status = 400;
    err.details = [{ path: "symbol", message: "Symbol does not exist on Binance" }];
    throw err;
  }

  const signal = await Signal.create({ ...input, symbol });

  // Immediately evaluate against current price — covers historical entries
  // where price has already moved past target/SL.
  try {
    await evaluateAndPersist(signal);
  } catch (err) {
    logger.warn(`Initial eval failed for new signal ${signal.id}: ${err.message}`);
  }
  return Signal.findById(signal._id);
}

export async function listSignals(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.symbol) filter.symbol = query.symbol.toUpperCase();
  if (query.direction) filter.direction = query.direction;
  const limit = query.limit ?? 100;
  const sort = query.sort ?? "-created_at";
  return Signal.find(filter).sort(sort).limit(limit);
}

/** Get one signal — also enriches with live price + ROI for OPEN signals. */
export async function getSignalById(id) {
  const signal = await Signal.findById(id);
  if (!signal) return null;
  const obj = signal.toJSON();
  if (signal.status === SIGNAL_STATUS.OPEN) {
    try {
      const price = await getPrice(signal.symbol);
      obj.current_price = price;
      obj.live_roi = computeRoi(signal, price);
    } catch (err) {
      obj.current_price = null;
      obj.live_roi = null;
    }
  }
  return obj;
}

export async function deleteSignal(id) {
  const r = await Signal.findByIdAndDelete(id);
  return !!r;
}

/** Evaluate a single signal & persist if state changed. */
export async function evaluateAndPersist(signal) {
  if (signal.status !== SIGNAL_STATUS.OPEN) return signal;
  let price = null;
  try {
    price = await getPrice(signal.symbol);
  } catch (err) {
    logger.warn(`Price fetch failed for ${signal.symbol}: ${err.message}`);
  }
  const next = evaluateTransition(signal, price);
  if (!next) return signal;
  // Atomic update — only transition if still OPEN (prevents race with cron)
  const updated = await Signal.findOneAndUpdate(
    { _id: signal._id, status: SIGNAL_STATUS.OPEN },
    { $set: next },
    { new: true },
  );
  if (updated) {
    logger.info(
      `Signal ${updated.id} ${updated.symbol} ${updated.direction} → ${next.status} @ ${next.realized_price} (ROI ${next.realized_roi}%)`,
    );
  }
  return updated ?? signal;
}

/** Evaluate ALL open signals — used by cron. Batches Binance calls per symbol. */
export async function evaluateAllOpen() {
  const open = await Signal.find({ status: SIGNAL_STATUS.OPEN });
  if (open.length === 0) return { evaluated: 0, transitioned: 0 };

  const prices = await getPrices(open.map((s) => s.symbol));
  let transitioned = 0;
  const now = new Date();

  for (const sig of open) {
    const price = prices[sig.symbol];
    const next = evaluateTransition(sig, price, now);
    if (!next) continue;
    const updated = await Signal.findOneAndUpdate(
      { _id: sig._id, status: SIGNAL_STATUS.OPEN },
      { $set: next },
      { new: true },
    );
    if (updated) {
      transitioned++;
      logger.info(`[CRON] ${updated.symbol} ${updated.direction} → ${next.status}`);
    }
  }
  return { evaluated: open.length, transitioned };
}

/** Quick status poll — for /signals/:id/status */
export async function getSignalStatus(id) {
  const signal = await Signal.findById(
    id,
    "status symbol direction entry_price realized_roi realized_price",
  );
  if (!signal) return null;
  let current_price = null;
  let live_roi = signal.realized_roi;
  if (signal.status === SIGNAL_STATUS.OPEN) {
    try {
      current_price = await getPrice(signal.symbol);
      live_roi = computeRoi(signal, current_price);
    } catch {}
  } else {
    current_price = signal.realized_price;
  }
  return {
    id: signal.id,
    status: signal.status,
    current_price,
    realized_roi: live_roi,
  };
}
