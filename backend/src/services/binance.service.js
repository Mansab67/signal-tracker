import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const CACHE_TTL_MS = 5_000;
const cache = new Map(); // symbol -> { price, ts }

const ALL_BINANCE_ENDPOINTS = [
  env.BINANCE_BASE_URL,
  ...env.BINANCE_FALLBACK_URLS,
  // Fallback mirrors that are often accessible
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://api4.binance.com",
];

/**
 * Fetch live price for a symbol from Binance with fallback endpoints.
 * Uses a short in-memory cache to dedupe bursts.
 */
export async function getPrice(symbol) {
  const sym = symbol.toUpperCase();
  const now = Date.now();
  const cached = cache.get(sym);
  if (cached && now - cached.ts < CACHE_TTL_MS) return cached.price;

  const endpoints = [...new Set(ALL_BINANCE_ENDPOINTS.filter(Boolean))];
  let lastError;

  for (const baseUrl of endpoints) {
    try {
      const url = `${baseUrl}/api/v3/ticker/price?symbol=${encodeURIComponent(sym)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Binance error [${res.status}] for ${sym}: ${body.slice(0, 200)}`);
      }
      const data = await res.json();
      const price = parseFloat(data.price);
      if (!Number.isFinite(price)) throw new Error(`Invalid price from Binance for ${sym}`);
      cache.set(sym, { price, ts: now });
      return price;
    } catch (err) {
      lastError = err;
      logger.warn(`Binance endpoint ${baseUrl} failed for ${sym}: ${err.message}`);
    }
  }

  throw new Error(
    `All Binance endpoints failed for ${sym}. Last error: ${lastError?.message || "Unknown error"}`,
  );
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
    }),
  );
  return results;
}
