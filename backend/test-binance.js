import { getPrice } from "./src/services/binance.service.js";

const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];

console.log("Testing Binance connections...\n");
for (const sym of symbols) {
  try {
    const price = await getPrice(sym);
    console.log(`✅ ${sym}: $${price}`);
  } catch (err) {
    console.log(`❌ ${sym}: ${err.message}`);
  }
}
