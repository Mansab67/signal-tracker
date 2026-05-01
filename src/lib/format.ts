import type { Direction, Signal, SignalStatus } from "@/lib/api";

export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(6);
}

export function formatRoi(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function computeLiveRoi(
  signal: Pick<Signal, "direction" | "entry_price">,
  currentPrice: number | null | undefined,
): number | null {
  if (currentPrice == null || !Number.isFinite(currentPrice) || !signal.entry_price) return null;
  const raw =
    signal.direction === "BUY"
      ? ((currentPrice - signal.entry_price) / signal.entry_price) * 100
      : ((signal.entry_price - currentPrice) / signal.entry_price) * 100;
  return Math.round(raw * 100) / 100;
}

export function timeRemaining(expiryIso: string, now: Date = new Date()): string {
  const ms = new Date(expiryIso).getTime() - now.getTime();
  if (ms <= 0) return "Expired";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function statusLabel(s: SignalStatus): string {
  switch (s) {
    case "OPEN":
      return "Open";
    case "TARGET_HIT":
      return "Target Hit";
    case "STOPLOSS_HIT":
      return "Stop Loss";
    case "EXPIRED":
      return "Expired";
  }
}

export function directionLabel(d: Direction): string {
  return d;
}

export function toLocalDateTimeInput(date: Date): string {
  // For <input type="datetime-local"> — local TZ, no seconds
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
