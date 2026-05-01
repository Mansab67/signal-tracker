import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — SignalTracker" },
      {
        name: "description",
        content: "Live trading signals dashboard with auto-evaluation and ROI tracking.",
      },
    ],
  }),
});

function DashboardPage() {
  const navigate = useNavigate();
  return (
    <AppLayout
      title="Trading Signals"
      description="Live tracking with automatic status evaluation"
      actions={
        <Button onClick={() => navigate({ to: "/signals/new" })} className="font-semibold">
          <Plus className="h-4 w-4 mr-1.5" /> New Signal
        </Button>
      }
    >
      <SignalsTable />
    </AppLayout>
  );
}
