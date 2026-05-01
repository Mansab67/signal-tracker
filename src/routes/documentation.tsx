import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock, Target, AlertTriangle, CheckCircle2, DollarSign, Zap, Database, Globe, Shield, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/documentation")({
  component: DocumentationPage,
});

function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow-bull)]">
            <BookOpen className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-gradient-primary mb-4">
            SignalTracker Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete guide to the crypto trading signal tracking system — architecture, business logic, and API reference.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Overview", href: "#overview", icon: Globe },
            { title: "Architecture", href: "#architecture", icon: Database },
            { title: "Signal Flow", href: "#signal-flow", icon: Zap },
            { title: "Status Logic", href: "#status-logic", icon: Target },
            { title: "ROI Calculation", href: "#roi", icon: DollarSign },
            { title: "API Reference", href: "#api", icon: Shield },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
            </a>
          ))}
        </div>

        {/* Overview Section */}
        <section id="overview" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Overview</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-8">
              <h3 className="text-xl font-semibold mb-4">Objective</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                SignalTracker is a production-grade full-stack application for tracking cryptocurrency trading signals. It integrates with Binance's live price feed to automatically evaluate signal status and calculate realized/unrealized ROI.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The system implements proper separation of concerns with Express.js backend (MVC pattern), React frontend with TanStack Router, and MongoDB for persistent storage.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "Full CRUD operations for trading signals",
                  "Direction-aware validation (BUY/SELL price rules)",
                  "Live Binance price integration with 5-second cache",
                  "Background cron worker (30-second evaluation cycle)",
                  "Final-state guarantee (no status regression)",
                  "Direction-aware ROI calculation (2 decimal precision)",
                  "Historical entry support (up to 24 hours in past)",
                  "Auto-expiry handling with immutability",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Database className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Architecture</h2>
          </div>
          <div className="rounded-xl border bg-card p-8">
            <h3 className="text-xl font-semibold mb-6">Project Structure</h3>
            <pre className="bg-muted p-6 rounded-lg overflow-x-auto text-sm">
{`signal-tracker-pro-main/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Mongoose connection
│   │   │   └── env.js          # Env loader + validation
│   │   ├── models/
│   │   │   └── Signal.js       # Mongoose schema
│   │   ├── validators/
│   │   │   └── signal.validator.js  # Zod validation
│   │   ├── services/
│   │   │   ├── binance.service.js   # Live price fetcher
│   │   │   ├── signal.service.js    # CRUD + evaluation
│   │   │   └── evaluator.service.js # Status transitions
│   │   ├── controllers/
│   │   │   └── signal.controller.js
│   │   ├── routes/
│   │   │   └── signal.routes.js
│   │   ├── middleware/
│   │   │   ├── error.middleware.js
│   │   │   └── notFound.middleware.js
│   │   ├── jobs/
│   │   │   └── cron.js         # 30s evaluation worker
│   │   ├── utils/
│   │   │   └── logger.js       # Structured logger
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── src/                      # Frontend (React + TanStack Router)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── signals/
│   │   │   ├── SignalsTable.tsx
│   │   │   └── CreateSignalForm.tsx
│   │   └── ui/              # Radix UI components
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx        # Dashboard (/)
│   │   └── signals.new.tsx  # New Signal (/signals/new)
│   ├── router.tsx
│   └── main.tsx
│
└── package.json`}
            </pre>
          </div>
        </section>

        {/* Signal Flow Section */}
        <section id="signal-flow" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Signal Flow</h2>
          </div>
          <div className="grid gap-8">
            <div className="rounded-xl border bg-card p-8">
              <h3 className="text-xl font-semibold mb-6">Signal Lifecycle</h3>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Signal Creation",
                    desc: "User submits signal via form → Zod validation (direction-aware price rules, time validation) → Symbol validated against Binance → Saved to MongoDB with status=OPEN",
                    icon: PlusCircle,
                  },
                  {
                    step: "2",
                    title: "Immediate Evaluation",
                    desc: "Signal is evaluated immediately against current Binance price to catch cases where price already moved past target/SL (e.g., historical entries)",
                    icon: Clock,
                  },
                  {
                    step: "3",
                    title: "Background Cron (Every 30s)",
                    desc: "Worker fetches all OPEN signals → Groups by symbol → Batch fetches prices from Binance (1 call per unique symbol) → Evaluates each signal → Atomic updates only on state change",
                    icon: Zap,
                  },
                  {
                    step: "4",
                    title: "Status Transitions",
                    desc: "OPEN → TARGET_HIT / STOPLOSS_HIT / EXPIRED. Once terminal state reached, never reverts. Evaluator skips non-OPEN signals.",
                    icon: Target,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-lg">{item.title}</h4>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Historical Entry Support</h4>
                <p className="text-sm text-muted-foreground">
                  Entry time can be up to 24 hours in the past. System evaluates against current live price immediately.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Database className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Atomic Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Uses Mongoose findOneAndUpdate with status filter to prevent race conditions during concurrent evaluations.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Immutability Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  TARGET_HIT, STOPLOSS_HIT, and EXPIRED statuses are final. Cron skips non-OPEN signals entirely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Status Logic Section */}
        <section id="status-logic" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Target className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Status Transition Logic</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bull/10">
                  <span className="text-lg font-bold text-bull">B</span>
                </div>
                <h3 className="text-xl font-semibold">BUY Signals</h3>
              </div>
              <div className="space-y-4">
                {[
                  { condition: "price >= target_price", status: "TARGET_HIT", color: "text-green-500", icon: CheckCircle2 },
                  { condition: "price <= stop_loss", status: "STOPLOSS_HIT", color: "text-destructive", icon: AlertTriangle },
                  { condition: "now > expiry_time (and no hit)", status: "EXPIRED", color: "text-muted-foreground", icon: Clock },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <div className="flex-1">
                      <div className="font-mono text-sm text-muted-foreground mb-1">{item.condition}</div>
                      <div className={`font-semibold ${item.color}`}>→ {item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bear/10">
                  <span className="text-lg font-bold text-bear">S</span>
                </div>
                <h3 className="text-xl font-semibold">SELL Signals</h3>
              </div>
              <div className="space-y-4">
                {[
                  { condition: "price <= target_price", status: "TARGET_HIT", color: "text-green-500", icon: CheckCircle2 },
                  { condition: "price >= stop_loss", status: "STOPLOSS_HIT", color: "text-destructive", icon: AlertTriangle },
                  { condition: "now > expiry_time (and no hit)", status: "EXPIRED", color: "text-muted-foreground", icon: Clock },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <div className="flex-1">
                      <div className="font-mono text-sm text-muted-foreground mb-1">{item.condition}</div>
                      <div className={`font-semibold ${item.color}`}>→ {item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-destructive/50 bg-destructive/5 p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive mb-2">Final State Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  Once a signal reaches TARGET_HIT, STOPLOSS_HIT, or EXPIRED, its status becomes immutable. The cron worker only processes signals with status=OPEN, ensuring no state regression.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section id="roi" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <DollarSign className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">ROI Calculation</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bull/10 text-bull font-bold">B</span>
                BUY Direction
              </h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-center text-lg mb-4">
                ROI = (Current − Entry) / Entry × 100
              </div>
              <p className="text-sm text-muted-foreground">
                Profit when price increases above entry. Example: Entry $65,000 → Current $70,000 = <span className="text-success font-semibold">(+) 7.69%</span>
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bear/10 text-bear font-bold">S</span>
                SELL Direction
              </h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-center text-lg mb-4">
                ROI = (Entry − Current) / Entry × 100
              </div>
              <p className="text-sm text-muted-foreground">
                Profit when price decreases below entry. Example: Entry $70,000 → Current $65,000 = <span className="text-success font-semibold">(+) 7.14%</span>
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              ROI is calculated in real-time for OPEN signals and displayed with 2 decimal precision. Upon reaching TARGET_HIT or STOPLOSS_HIT, ROI is permanently stored in <code className="bg-muted px-1.5 py-0.5 rounded">realized_roi</code>.
            </p>
          </div>
        </section>

        {/* API Reference */}
        <section id="api" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">API Reference</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                method: "POST",
                path: "/api/signals",
                desc: "Create a new trading signal",
                body: (
                  <>
                    <div className="font-mono text-sm bg-muted p-3 rounded mb-2">
                      {`{
  "symbol": "BTCUSDT",
  "direction": "BUY",        // or "SELL"
  "entry_price": 65000,
  "stop_loss": 63000,        // < entry for BUY, > entry for SELL
  "target_price": 70000,     // > entry for BUY, < entry for SELL
  "entry_time": "2026-04-30T08:00:00Z",
  "expiry_time": "2026-05-02T08:00:00Z"
}`}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Validation:</strong> Symbol checked against Binance; Entry time can be up to 24h in past; Expiry &gt; Entry; Direction-aware price rules enforced.
                    </p>
                  </>
                ),
              },
              {
                method: "GET",
                path: "/api/signals",
                desc: "List all signals with optional filtering",
                body: (
                  <p className="text-sm text-muted-foreground">
                    Query params: <code>status</code>, <code>symbol</code>, <code>direction</code>, <code>limit</code> (default 100), <code>sort</code> (default <code>-created_at</code>).
                    Returns: <code>200</code> + <code>{`{ data: [...], count }`}</code>
                  </p>
                ),
              },
              {
                method: "GET",
                path: "/api/signals/:id",
                desc: "Get single signal with live price enrichment",
                body: (
                  <p className="text-sm text-muted-foreground">
                    Returns: <code>200</code> + signal object with <code>current_price</code> and <code>live_roi</code> (for OPEN signals).
                    Returns <code>404</code> if not found.
                  </p>
                ),
              },
              {
                method: "GET",
                path: "/api/signals/:id/status",
                desc: "Lightweight status poll",
                body: (
                  <p className="text-sm text-muted-foreground">
                    Returns: <code>{`{ id, status, current_price, realized_roi }`}</code>. Minimal DB fields — no signal details.
                  </p>
                ),
              },
              {
                method: "DELETE",
                path: "/api/signals/:id",
                desc: "Soft-delete a signal",
                body: <p className="text-sm text-muted-foreground">Returns: <code>204 No Content</code>.</p>,
              },
            ].map((endpoint, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoint.method === "GET" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                    endpoint.method === "POST" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                    "bg-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-base font-semibold">{endpoint.path}</code>
                </div>
                <div className="p-6">
                  <p className="text-foreground mb-4">{endpoint.desc}</p>
                  {endpoint.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Stack */}
        <section className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Database className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Technical Stack</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Backend",
                items: [
                  { name: "Node.js", desc: "Runtime" },
                  { name: "Express 4.x", desc: "Web framework" },
                  { name: "Mongoose 8.x", desc: "MongoDB ODM" },
                  { name: "node-cron", desc: "Scheduled jobs" },
                  { name: "Zod", desc: "Runtime validation" },
                  { name: "dotenv", desc: "Config management" },
                ],
              },
              {
                title: "Frontend",
                items: [
                  { name: "React 19", desc: "UI library" },
                  { name: "TanStack Router", desc: "File-based routing" },
                  { name: "TanStack Query", desc: "Data fetching" },
                  { name: "Radix UI", desc: "Unstyled components" },
                  { name: "Tailwind CSS 4", desc: "Styling" },
                  { name: "Vite 7", desc: "Build tool" },
                ],
              },
            ].map((group, i) => (
              <div key={i} className="rounded-xl border bg-card p-8">
                <h3 className="text-xl font-semibold mb-6">{group.title}</h3>
                <div className="grid gap-4">
                  {group.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>SignalTracker Pro — Built with React, Express, and MongoDB</p>
          <p className="mt-1">Backend: <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">http://localhost:4000</a></p>
        </div>
      </div>
    </div>
  );
}
