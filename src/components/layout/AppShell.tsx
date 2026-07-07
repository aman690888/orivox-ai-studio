import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Settings as SettingsIcon, Plus, Command } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "@/components/command/CommandPalette";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/presentations", label: "Presentations", icon: LayoutGrid },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { open } = useCommandPalette();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar/60 px-3 py-5 backdrop-blur-xl md:flex">
        <Link to="/home" className="mb-6 px-2">
          <Logo />
        </Link>

        <button
          onClick={() => navigate({ to: "/workspace/$id", params: { id: "new" } })}
          className="mx-1 mb-4 flex items-center justify-between rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New presentation
          </span>
        </button>

        <nav className="flex flex-1 flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                  active ? "text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-white/[0.06]"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={open}
          className="mt-2 flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-white/20 hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Command className="h-3.5 w-3.5" />
            Command palette
          </span>
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
