import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateSignalForm } from "@/components/signals/CreateSignalForm";

export const Route = createFileRoute("/signals/new")({
  component: NewSignalPage,
  head: () => ({
    meta: [
      { title: "New Signal — SignalTracker" },
      { name: "description", content: "Create a new trading signal with direction-aware validation." },
    ],
  }),
});

function NewSignalPage() {
  return (
    <AppLayout
      title="New Trading Signal"
      description="Direction-aware validation · Historical entries up to 24h"
    >
      <CreateSignalForm />
    </AppLayout>
  );
}
