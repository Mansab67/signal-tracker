import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, Activity, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/signals/new", label: "New Signal", icon: PlusCircle },
] as const;

export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow-bull)]">
          <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">SignalTracker</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Pro Edition
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-2">
        <div className="rounded-lg bg-surface-elevated p-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live Binance feed
          </div>
          <div className="mt-1 text-muted-foreground/70">
            Auto-evaluation every 30s
          </div>
        </div>
        <Link
          to="/documentation"
          className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5" /> Documentation
        </Link>
      </div>
    </aside>
  );
}
