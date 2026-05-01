import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-16 border-b bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between h-full px-6 md:px-8">
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">{actions}</div>
          </div>
        </header>
        <main className="flex-1 px-6 md:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
