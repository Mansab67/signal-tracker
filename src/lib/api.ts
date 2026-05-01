/**
 * SignalTracker API client.
 * Talks to the standalone Express backend (deployed on Render/Railway).
 *
 * Set VITE_API_BASE_URL in Workspace → Build Secrets, e.g.
 *   VITE_API_BASE_URL=https://signaltracker-api.onrender.com
 */

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000";

export type SignalStatus = "OPEN" | "TARGET_HIT" | "STOPLOSS_HIT" | "EXPIRED";
export type Direction = "BUY" | "SELL";

export interface Signal {
  id: string;
  symbol: string;
  direction: Direction;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  entry_time: string;
  expiry_time: string;
  status: SignalStatus;
  realized_roi: number | null;
  realized_price: number | null;
  realized_at: string | null;
  created_at: string;
  updated_at: string;
  current_price?: number | null;
  live_roi?: number | null;
}

export interface CreateSignalInput {
  symbol: string;
  direction: Direction;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  entry_time: string;
  expiry_time: string;
}

export interface ApiError {
  error: string;
  details?: { path: string; message: string }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error((data as ApiError)?.error || `Request failed (${res.status})`) as Error & {
      status: number;
      details?: { path: string; message: string }[];
    };
    err.status = res.status;
    err.details = (data as ApiError)?.details;
    throw err;
  }
  return data as T;
}

export const api = {
  getBaseUrl: () => BASE_URL,

  async listSignals(params?: { status?: SignalStatus; symbol?: string }): Promise<Signal[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.symbol) qs.set("symbol", params.symbol);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const res = await request<{ data: Signal[]; count: number }>(`/api/signals${suffix}`);
    return res.data;
  },

  getSignal(id: string) {
    return request<Signal>(`/api/signals/${id}`);
  },

  createSignal(input: CreateSignalInput) {
    return request<Signal>(`/api/signals`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteSignal(id: string) {
    return request<void>(`/api/signals/${id}`, { method: "DELETE" });
  },

  health() {
    return request<{ status: string; db: string; evaluator: unknown }>(`/health`);
  },
};
