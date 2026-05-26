import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background pb-20">
      <main className="mx-auto max-w-lg px-4 pt-safe">{children}</main>
      <BottomNav />
    </div>
  );
}
