import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Play, Presentation as PresIcon, Zap, Clock } from "lucide-react";
import { PromptBox } from "@/components/prompt/PromptBox";
import { suggestions, categories } from "@/lib/mock";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentations } from "@/lib/database/presentations";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — Orivox" }] }),
  component: Home,
});

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
  input: "4px 18px 4px 16px / 18px 4px 16px 4px",
};

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");

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
  const recents = presentations.length > 1 ? presentations.slice(1, 5) : [];

  return (
    <div className="h-full w-full overflow-y-auto px-6 py-10 md:px-10 md:py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        {/* ── Header ── */}
        <header className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center self-start gap-2 px-3 py-1 bg-[#fff9c4] border-[2px] border-[#2d2d2d] text-xs shadow-[2px_2px_0px_0px_#2d2d2d]"
            style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
          >
            📅 {dateLabel}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl font-bold text-[#2d2d2d]"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            {greeting},{" "}
            <span className="relative">
              {userName} ✌️
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                height="6"
              >
                <path
                  d="M0,3 Q25,0 50,3 Q75,6 100,3"
                  stroke="#ff4d4d"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-base text-[#6b6460]"
            style={{ fontFamily: "Patrick Hand, cursive" }}
          >
            What are we building today?
          </motion.p>
        </header>

        {/* ── Prompt Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 280, damping: 22 }}
          className="relative"
        >
          {/* Tilted card behind */}
          <div
            className="absolute inset-0 bg-[#e5e0d8] border-[2px] border-[#2d2d2d] -z-10"
            style={{ borderRadius: R.card, transform: "rotate(1.5deg) translate(4px, 4px)" }}
          />
          <div
            className="relative bg-white border-[3px] border-[#2d2d2d] p-6 shadow-[5px_5px_0px_0px_#ff4d4d]"
            style={{ borderRadius: R.card }}
          >
            {/* Tape */}
            <div
              className="absolute -top-4 left-1/2 w-12 h-4 bg-gray-300/60 border border-dashed border-gray-400/50"
              style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1deg)" }}
            />
            <p
              className="text-sm font-bold mb-3 text-[#6b6460]"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              ✍️ Describe your presentation...
            </p>
            <div
              className="border-[2px] border-[#2d2d2d] p-1 bg-[#fdfbf7] focus-within:border-[#2d5da1] focus-within:ring-2 focus-within:ring-[#2d5da1]/20 transition-all"
              style={{ borderRadius: R.input }}
            >
              <PromptBox
                value={prompt}
                onChange={setPrompt}
                onSubmit={go}
                placeholder="A startup pitch for investors in Series A..."
              />
            </div>
            {/* Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  onClick={() => setPrompt(s)}
                  className="text-xs px-3 py-1.5 bg-[#fdfbf7] border-[2px] border-dashed border-[#2d2d2d] hover:bg-[#e5e0d8] hover:border-solid transition-all duration-100"
                  style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Presentations ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="w-full aspect-video" />
                <div className="flex justify-between items-center px-1">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative flex flex-col items-center justify-center text-center py-16 px-8 bg-white border-[3px] border-dashed border-[#2d2d2d]"
            style={{ borderRadius: R.md }}
          >
            <div
              className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-3xl mb-5 shadow-[3px_3px_0px_0px_#2d2d2d] animate-wiggle"
              style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
            >
              <PresIcon className="w-7 h-7 text-[#2d2d2d]" strokeWidth={2.5} />
            </div>
            <h2
              className="text-xl font-bold text-[#2d2d2d]"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              Nothing here yet!
            </h2>
            <p
              className="mt-2 text-sm text-[#6b6460] max-w-xs"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              Type an idea in the box above and watch it come to life in seconds. ✨
            </p>
            <button
              onClick={() => go("A startup pitch deck for investors")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              <Zap size={16} strokeWidth={2.5} /> Try a demo deck
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Dashboard Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (Featured + Stats) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Featured (most recent) */}
                {featured && (
                  <section className="flex flex-col gap-3">
                    <div
                      className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#2d2d2d] text-white shadow-[2px_2px_0px_0px_#ff4d4d]"
                      style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                    >
                      <Clock size={12} strokeWidth={2.5} /> Continue where you left off
                    </div>
                    <Link to="/workspace/$id" params={{ id: featured.id }} className="group block">
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative bg-white border-[3px] border-[#2d2d2d] p-6 shadow-[5px_5px_0px_0px_#2d2d2d] hover:shadow-[7px_7px_0px_0px_#2d2d2d] transition-all"
                        style={{ borderRadius: R.card }}
                      >
                        {/* Tape */}
                        <div
                          className="absolute -top-3 left-8 w-10 h-4 bg-gray-300/60 border border-dashed border-gray-400/50"
                          style={{ borderRadius: "2px", transform: "rotate(-1deg)" }}
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div
                              className="inline-block px-2 py-0.5 text-xs bg-[#fff9c4] border-[1.5px] border-[#2d2d2d] mb-3"
                              style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
                            >
                              {featured.category}
                            </div>
                            <h3
                              className="text-xl md:text-2xl font-bold text-[#2d2d2d] line-clamp-2 group-hover:text-[#ff4d4d] transition-colors"
                              style={{ fontFamily: "Kalam, cursive" }}
                            >
                              {featured.title}
                            </h3>
                          </div>
                          <div
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#2d2d2d] text-white border-[2px] border-[#2d2d2d] shrink-0"
                            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                          >
                            Resume Editing{" "}
                            <ArrowRight
                              size={14}
                              strokeWidth={2.5}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </div>
                        </div>
                        {featured.progress !== undefined && (
                          <div className="mt-5 space-y-1.5">
                            <div
                              className="flex justify-between text-xs"
                              style={{ fontFamily: "Patrick Hand, cursive" }}
                            >
                              <span className="text-[#6b6460]">Completion</span>
                              <span className="font-bold text-[#2d2d2d]">{featured.progress}%</span>
                            </div>
                            <div
                              className="h-3 bg-[#fdfbf7] border-[2px] border-[#2d2d2d]"
                              style={{ borderRadius: "2px", overflow: "hidden" }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${featured.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-[#ff4d4d]"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  </section>
                )}

                {/* Workspace Statistics */}
                <section className="flex flex-col gap-3">
                   <div
                      className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#e5e0d8] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
                      style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                    >
                      📊 Workspace Stats
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Total Decks", value: "24", emoji: "📁" },
                        { label: "AI Prompts", value: "142", emoji: "✨" },
                        { label: "Views", value: "1.2k", emoji: "👀" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white border-[2px] border-[#2d2d2d] p-4 flex flex-col items-center justify-center text-center shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] transition-all" style={{ borderRadius: R.tag }}>
                          <span className="text-2xl mb-1">{stat.emoji}</span>
                          <span className="text-xl font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>{stat.value}</span>
                          <span className="text-xs text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                </section>
              </div>

              {/* Right Column (Recent Activity) */}
              <div className="flex flex-col gap-3">
                <div
                    className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#e5e0d8] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                  >
                    ⚡ Recent Activity
                  </div>
                  <div className="flex-1 bg-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] p-4 overflow-hidden relative" style={{ borderRadius: R.md }}>
                    <div className="absolute top-2 right-4 w-4 h-8 bg-gray-300/50 border border-dashed border-gray-400/40 rounded-[2px] rotate-[15deg]" />
                    <div className="flex flex-col gap-4 mt-2">
                      {[
                        { text: "Created Marketing Plan", time: "2h ago", icon: "✨" },
                        { text: "Exported Q3 Board Deck", time: "5h ago", icon: "📥" },
                        { text: "Shared Pitch Deck", time: "1d ago", icon: "🔗" },
                        { text: "Changed Theme to Neon", time: "2d ago", icon: "🎨" },
                        { text: "Added 5 slides", time: "3d ago", icon: "➕" }
                      ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 shrink-0 bg-[#fdfbf7] border-[1.5px] border-[#2d2d2d] flex items-center justify-center text-[10px] rounded-full">
                            {activity.icon}
                          </div>
                          <div>
                            <p className="text-sm text-[#2d2d2d] font-bold" style={{ fontFamily: "Kalam, cursive" }}>{activity.text}</p>
                            <p className="text-xs text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            {/* Recent decks */}
            {recents.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#e5e0d8] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                  >
                    📚 Recent
                  </div>
                  <Link
                    to="/presentations"
                    className="text-xs text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recents.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                    >
                      <Link to="/present/$id" params={{ id: p.id }} className="group block">
                        <div
                          className="flex items-center gap-3 bg-white border-[2px] border-[#2d2d2d] px-4 py-3 shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                          style={{ borderRadius: R.tag }}
                        >
                          <div
                            className="w-10 h-10 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-lg shrink-0"
                            style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                          >
                            <Play size={14} strokeWidth={2.5} className="text-[#2d2d2d]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-bold truncate text-[#2d2d2d] group-hover:text-[#ff4d4d] transition-colors"
                              style={{ fontFamily: "Kalam, cursive" }}
                            >
                              {p.title}
                            </p>
                            <p
                              className="text-xs text-[#6b6460] truncate"
                              style={{ fontFamily: "Patrick Hand, cursive" }}
                            >
                              {p.category} · {p.updated}
                            </p>
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

        {/* ── Templates ── */}
        <section className="flex flex-col gap-5 pt-4 border-t-[2px] border-dashed border-[#2d2d2d]">
          <div
            className="inline-flex items-center self-start gap-2 px-3 py-1 text-xs bg-[#2d5da1] text-white shadow-[2px_2px_0px_0px_#2d2d2d]"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            ✨ Start from a template
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                onClick={() => setPrompt(`A ${c.name.toLowerCase()} on `)}
                className="group flex flex-col items-start gap-3 bg-white border-[2.5px] border-[#2d2d2d] p-5 text-left shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#fff9c4] transition-all duration-100"
                style={{
                  borderRadius: R.tag,
                  transform: `rotate(${[-0.8, 0.6, -0.5, 0.7][i % 4]}deg)`,
                }}
              >
                <div
                  className="text-xl w-10 h-10 bg-[#fdfbf7] border-[2px] border-[#2d2d2d] flex items-center justify-center"
                  style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                >
                  {["🚀", "📊", "🎓", "💡", "🌍", "🏆", "📈", "🔬"][i % 8]}
                </div>
                <div>
                  <p
                    className="text-sm font-bold text-[#2d2d2d]"
                    style={{ fontFamily: "Kalam, cursive" }}
                  >
                    {c.name}
                  </p>
                  <p
                    className="mt-1 text-xs text-[#6b6460] line-clamp-2 leading-relaxed"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  >
                    {c.hint}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
