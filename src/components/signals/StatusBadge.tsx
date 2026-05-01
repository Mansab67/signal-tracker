import { cn } from "@/lib/utils";
import type { SignalStatus, Direction } from "@/lib/api";

export function StatusBadge({ status }: { status: SignalStatus }) {
  const styles: Record<SignalStatus, string> = {
    OPEN: "bg-info/15 text-info border-info/30",
    TARGET_HIT: "bg-bull/15 text-bull border-bull/30",
    STOPLOSS_HIT: "bg-bear/15 text-bear border-bear/30",
    EXPIRED: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<SignalStatus, string> = {
    OPEN: "OPEN",
    TARGET_HIT: "TARGET HIT",
    STOPLOSS_HIT: "STOP LOSS",
    EXPIRED: "EXPIRED",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
        styles[status]
      )}
    >
      {status === "OPEN" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-info opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-info" />
        </span>
      )}
      {labels[status]}
    </span>
  );
}

export function DirectionBadge({ direction }: { direction: Direction }) {
  const isBuy = direction === "BUY";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wider",
        isBuy ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
      )}
    >
      {isBuy ? "▲" : "▼"} {direction}
    </span>
  );
}
