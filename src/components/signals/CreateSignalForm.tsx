import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toLocalDateTimeInput } from "@/lib/format";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const schema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(5, "Min 5 chars")
      .max(20, "Too long")
      .regex(/^[A-Z0-9]+$/i, "Letters & numbers only"),
    direction: z.enum(["BUY", "SELL"]),
    entry_price: z.coerce.number().positive("Must be > 0"),
    stop_loss: z.coerce.number().positive("Must be > 0"),
    target_price: z.coerce.number().positive("Must be > 0"),
    entry_time: z.string().min(1, "Required"),
    expiry_time: z.string().min(1, "Required"),
  })
  .superRefine((data, ctx) => {
    if (data.direction === "BUY") {
      if (!(data.stop_loss < data.entry_price))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stop_loss"],
          message: "BUY: stop loss must be below entry",
        });
      if (!(data.target_price > data.entry_price))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["target_price"],
          message: "BUY: target must be above entry",
        });
    } else {
      if (!(data.stop_loss > data.entry_price))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stop_loss"],
          message: "SELL: stop loss must be above entry",
        });
      if (!(data.target_price < data.entry_price))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["target_price"],
          message: "SELL: target must be below entry",
        });
    }
    const entry = new Date(data.entry_time).getTime();
    const expiry = new Date(data.expiry_time).getTime();
    const now = Date.now();
    if (Number.isNaN(entry)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["entry_time"], message: "Invalid date" });
    } else {
      if (entry > now + 60_000)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entry_time"],
          message: "Cannot be in the future",
        });
      if (entry < now - ONE_DAY_MS)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entry_time"],
          message: "Cannot be more than 24h in the past",
        });
    }
    if (Number.isNaN(expiry)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["expiry_time"], message: "Invalid date" });
    } else if (expiry <= entry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiry_time"],
        message: "Expiry must be after entry",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const POPULAR_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];

export function CreateSignalForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "BTCUSDT",
      direction: "BUY",
      entry_price: undefined as unknown as number,
      stop_loss: undefined as unknown as number,
      target_price: undefined as unknown as number,
      entry_time: toLocalDateTimeInput(now),
      expiry_time: toLocalDateTimeInput(inOneDay),
    },
    mode: "onChange",
  });

  const direction = form.watch("direction");
  const symbol = form.watch("symbol");

  async function fetchLivePrice() {
    if (!symbol) return;
    try {
      const r = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`,
      );
      if (!r.ok) throw new Error("Symbol not found on Binance");
      const j = await r.json();
      const p = parseFloat(j.price);
      form.setValue("entry_price", p, { shouldValidate: true });
      toast.success(`Loaded live price: ${p}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch price");
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        symbol: values.symbol.toUpperCase(),
        entry_time: new Date(values.entry_time).toISOString(),
        expiry_time: new Date(values.expiry_time).toISOString(),
      };
      const created = await api.createSignal(payload);
      toast.success(`Signal created — ${created.symbol} ${created.direction}`);
      navigate({ to: "/" });
    } catch (err) {
      const e = err as Error & { details?: { path: string; message: string }[] };
      if (e.details?.length) {
        e.details.forEach((d) => {
          form.setError(d.path as keyof FormValues, { message: d.message });
        });
        toast.error("Validation failed");
      } else {
        toast.error(e.message || "Failed to create signal");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-xl border bg-card p-6 md:p-8 shadow-[var(--shadow-card)]"
    >
      {/* Direction toggle */}
      <div>
        <Label className="mb-2 block">Direction</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => form.setValue("direction", "BUY", { shouldValidate: true })}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-bold transition-all",
              direction === "BUY"
                ? "border-bull bg-bull/15 text-bull shadow-[var(--shadow-glow-bull)]"
                : "border-border bg-surface text-muted-foreground hover:border-bull/50 hover:text-bull",
            )}
          >
            <ArrowUpCircle className="h-5 w-5" /> BUY (Long)
          </button>
          <button
            type="button"
            onClick={() => form.setValue("direction", "SELL", { shouldValidate: true })}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-bold transition-all",
              direction === "SELL"
                ? "border-bear bg-bear/15 text-bear shadow-[var(--shadow-glow-bear)]"
                : "border-border bg-surface text-muted-foreground hover:border-bear/50 hover:text-bear",
            )}
          >
            <ArrowDownCircle className="h-5 w-5" /> SELL (Short)
          </button>
        </div>
      </div>

      {/* Symbol */}
      <div>
        <Label htmlFor="symbol">Trading Pair</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id="symbol"
            {...form.register("symbol", {
              onChange: (e) => (e.target.value = e.target.value.toUpperCase()),
            })}
            placeholder="BTCUSDT"
            className="font-mono uppercase"
          />
          <Button type="button" variant="outline" onClick={fetchLivePrice}>
            Use live price
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {POPULAR_PAIRS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => form.setValue("symbol", p, { shouldValidate: true })}
              className="rounded-md border bg-surface px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
        <FieldError msg={form.formState.errors.symbol?.message} />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PriceField
          label="Entry Price"
          register={form.register("entry_price")}
          error={form.formState.errors.entry_price?.message}
        />
        <PriceField
          label={`Target ${direction === "BUY" ? "(above entry)" : "(below entry)"}`}
          register={form.register("target_price")}
          error={form.formState.errors.target_price?.message}
          accent="bull"
        />
        <PriceField
          label={`Stop Loss ${direction === "BUY" ? "(below entry)" : "(above entry)"}`}
          register={form.register("stop_loss")}
          error={form.formState.errors.stop_loss?.message}
          accent="bear"
        />
      </div>

      {/* Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entry_time">Entry Time</Label>
          <Input
            id="entry_time"
            type="datetime-local"
            {...form.register("entry_time")}
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Up to 24 hours in the past allowed
          </p>
          <FieldError msg={form.formState.errors.entry_time?.message} />
        </div>
        <div>
          <Label htmlFor="expiry_time">Expiry Time</Label>
          <Input
            id="expiry_time"
            type="datetime-local"
            {...form.register("expiry_time")}
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Must be after entry time</p>
          <FieldError msg={form.formState.errors.expiry_time?.message} />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting} size="lg" className="flex-1 font-semibold">
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitting ? "Creating…" : "Create Signal"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PriceField({
  label,
  register,
  error,
  accent,
}: {
  label: string;
  register:
    | ReturnType<(typeof useForm<FormValues>)["prototype"]["register"]>
    | ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
  error?: string;
  accent?: "bull" | "bear";
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        step="any"
        {...register}
        placeholder="0.00"
        className={cn(
          "mt-1.5 font-mono",
          accent === "bull" && "border-bull/30 focus-visible:ring-bull/30",
          accent === "bear" && "border-bear/30 focus-visible:ring-bear/30",
        )}
      />
      <FieldError msg={error} />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}
