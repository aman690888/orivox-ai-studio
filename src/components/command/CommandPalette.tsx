import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Settings as SettingsIcon,
  FileDown,
  Copy,
  Trash2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentations } from "@/lib/database/presentations";

// Tiny global store (no zustand dependency)
const listeners = new Set<() => void>();
let paletteOpen = false;
const paletteApi = {
  getState: () => paletteOpen,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  set: (v: boolean) => {
    paletteOpen = v;
    listeners.forEach((l) => l());
  },
};

export function useCommandPalette() {
  const isOpen = useSyncExternalStore(paletteApi.subscribe, paletteApi.getState, () => false);
  return {
    isOpen,
    open: () => paletteApi.set(true),
    close: () => paletteApi.set(false),
    toggle: () => paletteApi.set(!paletteApi.getState()),
  };
}

export function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPalette();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: presentations = [] } = useQuery({
    queryKey: ["presentations", user?.id],
    queryFn: () => getPresentations(user!.id),
    enabled: !!user?.id && isOpen,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") paletteApi.set(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const run = (fn: () => void) => {
    close();
    setTimeout(fn, 60);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[#2d2d2d]/30 p-4 pt-[15vh] backdrop-blur-[2px]"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden bg-white border-[3px] border-[#2d2d2d] shadow-[8px_8px_0px_0px_#2d2d2d]"
            style={{ borderRadius: "8px 42px 12px 38px / 42px 12px 38px 8px" }}
          >
            <Command label="Command palette" className="flex flex-col">
              <div className="flex items-center gap-3 border-b-2 border-dashed border-[#2d2d2d] px-4 bg-[#fdfbf7]">
                <Search className="h-4 w-4 text-[#2d2d2d]" />
                <Command.Input
                  autoFocus
                  placeholder="Search presentations, run commands..."
                  className="flex-1 bg-transparent py-4 text-sm font-bold text-[#2d2d2d] outline-none placeholder:text-[#6b6460]"
                  style={{ fontFamily: "Patrick Hand, cursive" }}
                />
                <kbd className="rounded border border-[#2d2d2d] bg-[#e5e0d8] px-1.5 py-0.5 font-mono text-[10px] text-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]">
                  esc
                </kbd>
              </div>
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#6b6460] [&_[cmdk-group-heading]]:font-[Kalam,cursive]"
                >
                  <Item
                    icon={Plus}
                    label="Create new presentation"
                    onSelect={() =>
                      run(() => navigate({ to: "/workspace/$id", params: { id: "new" } }))
                    }
                  />
                  <Item
                    icon={SettingsIcon}
                    label="Open settings"
                    onSelect={() => run(() => navigate({ to: "/settings" }))}
                  />
                  <Item
                    icon={FileDown}
                    label="Export current presentation"
                    onSelect={() =>
                      run(() => navigate({ to: "/export/$id", params: { id: "healthcare-ai" } }))
                    }
                  />
                  <Item icon={Copy} label="Duplicate current presentation" />
                  <Item icon={Trash2} label="Delete current presentation" />
                </Command.Group>

                <Command.Group
                  heading="Recent"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#6b6460] [&_[cmdk-group-heading]]:font-[Kalam,cursive]"
                >
                  {presentations.slice(0, 5).map((p) => (
                    <Item
                      key={p.id}
                      icon={Clock}
                      label={p.title}
                      hint={p.updated}
                      onSelect={() =>
                        run(() => navigate({ to: "/present/$id", params: { id: p.id } }))
                      }
                    />
                  ))}
                </Command.Group>
              </Command.List>
              <div className="flex items-center justify-between border-t-2 border-dashed border-[#2d2d2d] px-3 py-2 text-[11px] text-[#6b6460] font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
                <span>Orivox</span>
                <span className="flex items-center gap-2">
                  <kbd className="rounded border border-[#2d2d2d] bg-[#e5e0d8] px-1.5 py-0.5 font-mono shadow-[1px_1px_0px_0px_#2d2d2d] text-[#2d2d2d]">↑↓</kbd> Navigate
                  <kbd className="rounded border border-[#2d2d2d] bg-[#e5e0d8] px-1.5 py-0.5 font-mono shadow-[1px_1px_0px_0px_#2d2d2d] text-[#2d2d2d]">↵</kbd> Open
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({
  icon: Icon,
  label,
  hint,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onSelect?: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-[#2d2d2d] aria-selected:bg-[#2d2d2d] aria-selected:text-white border-[2px] border-transparent aria-selected:border-[#2d2d2d] aria-selected:shadow-[3px_3px_0px_0px_#ff4d4d] transition-all duration-100"
      style={{ fontFamily: "Patrick Hand, cursive", fontSize: "15px" }}
    >
      <Icon className="h-4 w-4 text-[#6b6460] group-aria-selected:text-[#ff4d4d]" />
      <span className="flex-1 truncate font-bold">{label}</span>
      {hint && <span className="text-[11px] text-[#6b6460] group-aria-selected:text-gray-300">{hint}</span>}
      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-aria-selected:opacity-100 group-aria-selected:text-white" />
    </Command.Item>
  );
}
