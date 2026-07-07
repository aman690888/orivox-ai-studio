import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { presentations } from "@/lib/mock";
import { MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/_app/presentations")({
  head: () => ({ meta: [{ title: "Presentations — Orivox" }] }),
  component: Presentations,
});

function Presentations() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Presentations</h1>
          <p className="mt-1 text-sm text-muted-foreground">{presentations.length} decks</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {presentations.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to="/present/$id" params={{ id: p.id }} className="group block">
              <motion.div whileHover={{ y: -2 }} className="glass overflow-hidden rounded-2xl p-2">
                <div className={`relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br ${grad(p.accent)}`}>
                  <div className="absolute inset-3 rounded-md bg-background/50 p-2 backdrop-blur-sm">
                    <div className="h-1.5 w-12 rounded bg-white/25" />
                    <div className="mt-1.5 h-1 w-16 rounded bg-white/15" />
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{p.category} · {p.updated}</div>
                  </div>
                  <button className="rounded-md p-1.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-white/5">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function grad(a: string) {
  return {
    electric: "from-electric/40 to-violet/30",
    violet: "from-violet/40 to-electric/20",
    emerald: "from-emerald-500/40 to-teal-500/20",
    amber: "from-amber-500/40 to-rose-500/20",
  }[a] || "from-electric/40 to-violet/30";
}
