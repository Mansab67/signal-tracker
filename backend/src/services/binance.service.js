import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const CACHE_TTL_MS = 5_000;
const cache = new Map(); // symbol -> { price, ts }

/**
 * Fetch live price for a symbol from Binance.
 * Uses a short in-memory cache to dedupe bursts.
 */
export async function getPrice(symbol) {
  const sym = symbol.toUpperCase();
  const now = Date.now();
  const cached = cache.get(sym);
  if (cached && now - cached.ts < CACHE_TTL_MS) return cached.price;

  const url = `${env.BINANCE_BASE_URL}/api/v3/ticker/price?symbol=${encodeURIComponent(sym)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Binance error [${res.status}] for ${sym}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const price = parseFloat(data.price);
  if (!Number.isFinite(price)) throw new Error(`Invalid price from Binance for ${sym}`);
  cache.set(sym, { price, ts: now });
  return price;
}

/** Verify a symbol exists on Binance (used at signal create). */
export async function symbolExists(symbol) {
  try {
    await getPrice(symbol);
    return true;
  } catch (err) {
    logger.warn(`Symbol check failed for ${symbol}: ${err.message}`);
    return false;
  }
}

/** Batch fetch — one HTTP call per unique symbol. */
export async function getPrices(symbols) {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const results = {};
  await Promise.all(
    unique.map(async (s) => {
      try {
        results[s] = await getPrice(s);
      } catch (err) {
        logger.warn(`Price fetch failed for ${s}: ${err.message}`);
        results[s] = null;
      }
    })
  );
  return results;
}
