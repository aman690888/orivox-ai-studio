import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/command/CommandPalette";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <CommandPalette />
    </>
  );
}
