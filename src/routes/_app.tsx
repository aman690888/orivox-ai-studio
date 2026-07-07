import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/command/CommandPalette";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <CommandPalette />
    </>
  );
}
