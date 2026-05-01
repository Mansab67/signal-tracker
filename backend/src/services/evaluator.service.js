import { SIGNAL_STATUS, DIRECTION } from "../models/Signal.js";

/**
 * Pure function — given a signal + current price + current time,
 * returns the next state OR null if no transition.
 *
 * Final-state guarantee: only OPEN signals can transition.
 */
export function evaluateTransition(signal, currentPrice, now = new Date()) {
  if (signal.status !== SIGNAL_STATUS.OPEN) return null;

  // 1) Expiry check first — but stop-loss / target take precedence
  //    if they are hit at the SAME tick (more conservative for traders).
  if (currentPrice != null && Number.isFinite(currentPrice)) {
    if (signal.direction === DIRECTION.BUY) {
      if (currentPrice >= signal.target_price) {
        return finalize(signal, SIGNAL_STATUS.TARGET_HIT, currentPrice, now);
      }
      if (currentPrice <= signal.stop_loss) {
        return finalize(signal, SIGNAL_STATUS.STOPLOSS_HIT, currentPrice, now);
      }
    } else if (signal.direction === DIRECTION.SELL) {
      if (currentPrice <= signal.target_price) {
        return finalize(signal, SIGNAL_STATUS.TARGET_HIT, currentPrice, now);
      }
      if (currentPrice >= signal.stop_loss) {
        return finalize(signal, SIGNAL_STATUS.STOPLOSS_HIT, currentPrice, now);
      }
    }
  }

  // 2) Expiry — no hit and time is past expiry
  if (now.getTime() > new Date(signal.expiry_time).getTime()) {
    const roi = currentPrice != null ? computeRoi(signal, currentPrice) : null;
    return {
      status: SIGNAL_STATUS.EXPIRED,
      realized_price: currentPrice ?? null,
      realized_roi: roi,
      realized_at: now,
    };
  }

  return null;
}

function finalize(signal, status, price, now) {
  return {
    status,
    realized_price: price,
    realized_roi: computeRoi(signal, price),
    realized_at: now,
  };
}

/** Direction-aware ROI %, rounded to 2 decimals. */
export function computeRoi(signal, currentPrice) {
  if (!Number.isFinite(currentPrice) || !signal.entry_price) return null;
  const raw =
    signal.direction === DIRECTION.BUY
      ? ((currentPrice - signal.entry_price) / signal.entry_price) * 100
      : ((signal.entry_price - currentPrice) / signal.entry_price) * 100;
  return Math.round(raw * 100) / 100;
}
