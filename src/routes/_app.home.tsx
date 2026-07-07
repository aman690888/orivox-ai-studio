import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { PromptBox } from "@/components/prompt/PromptBox";
import { featured, presentations, suggestions, categories } from "@/lib/mock";
import { useCommandPalette } from "@/components/command/CommandPalette";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — Orivox" }] }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const { open } = useCommandPalette();

  const go = (p: string) => navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: p } });

  const greeting = getGreeting();
  const dateLabel = getDateLabel();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      <div className="flex items-center justify-between">
        <div>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-muted-foreground">{dateLabel}</motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {greeting}, Alex.
          </motion.h1>
        </div>
        <button
          onClick={open}
          className="hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-white/20 hover:text-foreground md:flex"
        >
          <Sparkles className="h-3.5 w-3.5" /> Command palette
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">⌘K</kbd>
        </button>
      </div>

      <motion.div className="mt-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <PromptBox
          value={prompt}
          onChange={setPrompt}
          onSubmit={go}
          placeholder="Describe your next presentation..."
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.slice(0, 4).map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              onClick={() => setPrompt(s)}
              className="rounded-full border border-border bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground transition hover:border-electric/40 hover:bg-electric/5 hover:text-foreground hover:shadow-[0_0_20px_-4px_var(--electric)]"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>


      {/* Featured Continue */}
      <section className="mt-12">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Continue where you left off</div>
        <Link
          to="/workspace/$id"
          params={{ id: featured.id }}
          className="group block"
        >
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass relative flex items-stretch overflow-hidden rounded-3xl p-2"
          >
            <div className="relative m-1 hidden aspect-video w-64 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-electric/30 to-violet/30 md:block">
              <div className="absolute inset-4 rounded-lg bg-background/60 p-3 backdrop-blur">
                <div className="h-2 w-16 rounded bg-white/20" />
                <div className="mt-2 h-1.5 w-24 rounded bg-white/10" />
                <div className="mt-1 h-1.5 w-20 rounded bg-white/10" />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="text-xs text-muted-foreground">{featured.category}</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">{featured.title}</div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono text-foreground">{featured.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full max-w-md rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${featured.progress}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-electric to-violet"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground/90 transition group-hover:text-foreground">
                Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* Recent */}
      <section className="mt-12">
        <div className="mb-3 flex items-end justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Recent presentations</div>
          <Link to="/presentations" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presentations.slice(1, 7).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to="/present/$id" params={{ id: p.id }} className="group block">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass overflow-hidden rounded-2xl p-2"
                >
                  <div className={`relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br ${accentGrad(p.accent)}`}>
                    <div className="absolute inset-3 rounded-md bg-background/50 p-2 backdrop-blur-sm">
                      <div className="h-1.5 w-12 rounded bg-white/25" />
                      <div className="mt-1.5 h-1 w-16 rounded bg-white/15" />
                    </div>
                    <div className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80 opacity-0 backdrop-blur transition group-hover:opacity-100">
                      <Play className="inline h-3 w-3" />
                    </div>
                  </div>
                  <div className="px-2 py-2.5">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{p.category}</span>
                      <span>{p.updated}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mt-12">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Start from a category</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setPrompt(`A ${c.name.toLowerCase()} on `)}
              className="glass group flex items-center gap-2 rounded-xl px-4 py-2.5 text-left transition hover:border-white/20"
            >
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.hint}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function accentGrad(a: string) {
  return {
    electric: "from-electric/40 to-violet/30",
    violet: "from-violet/40 to-electric/20",
    emerald: "from-emerald-500/40 to-teal-500/20",
    amber: "from-amber-500/40 to-rose-500/20",
  }[a] || "from-electric/40 to-violet/30";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up, Alex";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

