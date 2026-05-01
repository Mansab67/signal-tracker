import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2, RefreshCw, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";
import { toast } from "sonner";
import { api, type Signal } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge, DirectionBadge } from "./StatusBadge";
import { computeLiveRoi, formatPrice, formatRoi, timeRemaining } from "@/lib/format";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL_MS = 15_000;

export function SignalsTable() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const [now, setNow] = useState(() => new Date());

  async function load() {
    setRefreshing(true);
    try {
      const data = await api.listSignals();
      setSignals(data);
      setError(null);
      // Fetch live prices for OPEN signals via Binance (direct, no API key)
      const openSymbols = [
        ...new Set(data.filter((s) => s.status === "OPEN").map((s) => s.symbol)),
      ];
      if (openSymbols.length > 0) {
        const priceMap: Record<string, number> = {};
        await Promise.all(
          openSymbols.map(async (sym) => {
            try {
              const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`);
              if (r.ok) {
                const j = await r.json();
                const p = parseFloat(j.price);
                if (Number.isFinite(p)) priceMap[sym] = p;
              }
            } catch {
              // eslint-disable-next-line no-empty
            }
          }),
        );
        setLivePrices((prev) => ({ ...prev, ...priceMap }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load signals";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const refresh = setInterval(load, REFRESH_INTERVAL_MS);
    const tick = setInterval(() => {
      setNow(new Date());
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL_MS / 1000 : c - 1));
    }, 1000);
    return () => {
      clearInterval(refresh);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string, symbol: string) {
    if (!confirm(`Delete signal for ${symbol}?`)) return;
    try {
      await api.deleteSignal(id);
      toast.success("Signal deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const stats = useMemo(() => {
    return {
      total: signals.length,
      open: signals.filter((s) => s.status === "OPEN").length,
      target: signals.filter((s) => s.status === "TARGET_HIT").length,
      sl: signals.filter((s) => s.status === "STOPLOSS_HIT").length,
      expired: signals.filter((s) => s.status === "EXPIRED").length,
    };
  }, [signals]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Open" value={stats.open} accent="info" />
        <StatCard
          label="Target Hit"
          value={stats.target}
          accent="bull"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Stop Loss"
          value={stats.sl}
          accent="bear"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          accent="muted"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Auto-refresh bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Auto-refreshing every 15s · next in{" "}
          <span className="font-mono text-foreground">{countdown}s</span>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={refreshing}>
          Refresh now
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <strong>Connection error:</strong> {error}
          <div className="text-xs mt-1 opacity-80">
            Check that the backend is running and{" "}
            <code className="font-mono">VITE_API_BASE_URL</code> is set correctly.
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface-elevated/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Symbol</th>
                <th className="px-4 py-3 text-left font-medium">Direction</th>
                <th className="px-4 py-3 text-right font-medium">Entry</th>
                <th className="px-4 py-3 text-right font-medium">Target</th>
                <th className="px-4 py-3 text-right font-medium">Stop Loss</th>
                <th className="px-4 py-3 text-right font-medium">Live Price</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">ROI</th>
                <th className="px-4 py-3 text-right font-medium">Expires In</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    Loading signals…
                  </td>
                </tr>
              )}
              {!loading && signals.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="text-muted-foreground mb-3">No signals yet</div>
                    <Button onClick={() => navigate({ to: "/signals/new" })}>
                      Create your first signal
                    </Button>
                  </td>
                </tr>
              )}
              {!loading &&
                signals.map((s) => {
                  const livePrice =
                    s.status === "OPEN" ? (livePrices[s.symbol] ?? null) : s.realized_price;
                  const roi = s.status === "OPEN" ? computeLiveRoi(s, livePrice) : s.realized_roi;
                  const remaining = s.status === "OPEN" ? timeRemaining(s.expiry_time, now) : "—";
                  return (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 hover:bg-surface-elevated/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold">{s.symbol}</td>
                      <td className="px-4 py-3">
                        <DirectionBadge direction={s.direction} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatPrice(s.entry_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-bull">
                        {formatPrice(s.target_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-bear">
                        {formatPrice(s.stop_loss)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {livePrice != null ? (
                          <span className="inline-flex items-center gap-1.5">
                            {s.status === "OPEN" && (
                              <span className="h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
                            )}
                            {formatPrice(livePrice)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={s.status} />
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-mono font-semibold",
                          roi != null && roi > 0 && "text-bull",
                          roi != null && roi < 0 && "text-bear",
                          roi == null && "text-muted-foreground",
                        )}
                      >
                        {formatRoi(roi)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-mono text-xs",
                          s.status === "OPEN" &&
                            new Date(s.expiry_time).getTime() - now.getTime() < 3600_000 &&
                            "text-warning",
                        )}
                      >
                        {remaining}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(s.id, s.symbol)}
                          aria-label="Delete signal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "default",
  icon,
}: {
  label: string;
  value: number;
  accent?: "default" | "bull" | "bear" | "info" | "muted";
  icon?: React.ReactNode;
}) {
  const accentClass = {
    default: "text-foreground",
    bull: "text-bull",
    bear: "text-bear",
    info: "text-info",
    muted: "text-muted-foreground",
  }[accent];
  return (
    <div className="rounded-xl border bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase tracking-wider text-[10px] font-medium">{label}</span>
        {icon && <span className={accentClass}>{icon}</span>}
      </div>
      <div className={cn("font-display text-2xl font-bold mt-1 tabular-nums", accentClass)}>
        {value}
      </div>
    </div>
  );
}
