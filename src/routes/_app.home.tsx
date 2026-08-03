import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Play, Presentation as PresIcon, Plus, Sparkles, Clock } from "lucide-react";
import { PromptBox } from "@/components/prompt/PromptBox";
import { suggestions, categories } from "@/lib/mock";
import { useCommandPalette } from "@/components/command/CommandPalette";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentations } from "@/lib/database/presentations";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — Orivox" }] }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const { open } = useCommandPalette();

  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ["presentations", user?.id],
    queryFn: () => getPresentations(user!.id),
    enabled: !!user?.id,
  });

  const go = (p: string) =>
    navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: p } });

  const greeting = getGreeting();
  const dateLabel = getDateLabel();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const featured = presentations.length > 0 ? presentations[0] : null;
  const recents = presentations.length > 1 ? presentations.slice(1, 7) : [];

  return (
    <div className="h-full w-full overflow-y-auto px-6 py-10 md:px-12 md:py-16 bg-white text-black">
      <div className="max-w-5xl mx-auto space-y-16">
        <header className="flex flex-col space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 self-start border border-black bg-white px-3 py-1 text-xs font-mono font-bold text-black uppercase"
          >
             {dateLabel}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-mono font-bold tracking-tight text-black md:text-5xl"
          >
            {greeting}, <span className="text-black">{userName}</span>.
          </motion.h1>
        </header>

        <motion.div
          className="relative group"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="relative bg-white p-2 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <PromptBox
              value={prompt}
              onChange={setPrompt}
              onSubmit={go}
              placeholder="What are we presenting today? Type an idea..."
            />
          </div>
          
          <div className="mt-5 flex flex-wrap gap-2 px-2">
            {suggestions.slice(0, 4).map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => setPrompt(s)}
                className="border border-black bg-white px-4 py-1.5 text-[11px] font-mono font-bold text-black uppercase transition-all hard-shadow-hover hover:bg-black hover:text-white"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric border-t-transparent shadow-[0_0_15px_var(--electric)]" />
          </div>
        ) : presentations.length === 0 ? (
          <motion.section 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
             className="relative flex flex-col items-center justify-center border border-black bg-white p-16 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="relative z-10 flex h-16 w-16 items-center justify-center border border-black bg-white mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <PresIcon className="h-7 w-7 text-black" />
            </div>
            <h2 className="relative z-10 text-xl font-mono font-bold text-black">Nothing here yet</h2>
            <p className="relative z-10 mt-2 text-sm text-black font-mono font-medium max-w-sm">
              Use the prompt above to magically generate your first presentation in seconds.
            </p>
          </motion.section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featured && (
              <section className="lg:col-span-2 flex flex-col space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-black ml-1">
                   <Clock className="w-3.5 h-3.5" /> Continue where you left off
                </div>
                <Link to="/workspace/$id" params={{ id: featured.id }} className="group block flex-1">
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative flex h-full min-h-[280px] border border-black bg-white p-1.5 transition-all hard-shadow-hover"
                  >
                    <div className="flex h-full w-full flex-col sm:flex-row bg-white border border-black">
                       <div className="relative flex-1 bg-white p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-black">
                          <div className="relative z-10 space-y-4">
                             <div className="inline-flex border border-black bg-white px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                               {featured.category}
                             </div>
                             <h3 className="text-2xl sm:text-3xl font-mono font-bold leading-tight text-black line-clamp-3 group-hover:underline decoration-2 underline-offset-4">
                               {featured.title}
                             </h3>
                          </div>
                       </div>
                       <div className="w-full sm:w-64 p-6 flex flex-col justify-center bg-white">
                          {featured.progress !== undefined && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between text-xs font-mono font-bold">
                                <span className="text-black">Completion</span>
                                <span className="text-black">{featured.progress}%</span>
                              </div>
                              <div className="h-2 w-full border border-black bg-white">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${featured.progress}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-black"
                                />
                              </div>
                            </div>
                          )}
                          <div className="mt-8 flex items-center gap-1.5 text-xs font-mono font-bold text-black uppercase">
                            Resume Editing <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                </Link>
              </section>
            )}

            {recents.length > 0 && (
              <section className="flex flex-col space-y-4 lg:col-span-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-black ml-1">
                  <span>Recent</span>
                  <Link to="/presentations" className="text-black hover:underline underline-offset-4 transition-all">View All</Link>
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  {recents.slice(0, 4).map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex-1"
                    >
                      <Link to="/present/$id" params={{ id: p.id }} className="group block h-full">
                        <div className="flex h-full items-center gap-4 border border-black bg-white p-2.5 transition-all hard-shadow-hover hover:bg-black hover:text-white">
                          <div className="relative flex h-12 w-16 shrink-0 items-center justify-center border border-black bg-white">
                             <Play className="h-4 w-4 text-black transition-colors group-hover:text-black" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="truncate text-sm font-mono font-bold text-black group-hover:text-white">{p.title}</div>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] font-mono text-black group-hover:text-white">
                              <span className="truncate">{p.category}</span>
                              <span className="h-0.5 w-0.5 bg-black group-hover:bg-white" />
                              <span className="shrink-0">{p.updated}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <section className="space-y-5 pt-8 border-t border-black">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-black ml-1">
             Templates
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => setPrompt(`A ${c.name.toLowerCase()} on `)}
                className="group relative flex flex-col items-start gap-3 border border-black bg-white p-5 text-left transition-all hard-shadow-hover hover:bg-black hover:text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center border border-black bg-white text-black group-hover:text-black">
                   <Plus className="h-5 w-5" />
                </div>
                <div className="relative z-10 mt-1">
                  <div className="text-sm font-mono font-bold text-black group-hover:text-white">{c.name}</div>
                  <div className="mt-1 text-xs font-mono font-medium text-black group-hover:text-white line-clamp-2 leading-relaxed">{c.hint}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function accentGrad(a: string) {
  return (
    {
      electric: "from-electric/40 to-violet/30",
      violet: "from-violet/40 to-electric/20",
      emerald: "from-emerald-500/40 to-teal-500/20",
      amber: "from-amber-500/40 to-rose-500/20",
    }[a] || "from-electric/40 to-violet/30"
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
