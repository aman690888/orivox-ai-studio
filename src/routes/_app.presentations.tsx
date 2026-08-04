import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Presentation as PresIcon, Plus, ExternalLink, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentations } from "@/lib/database/presentations";

export const Route = createFileRoute("/_app/presentations")({
  head: () => ({ meta: [{ title: "My Decks — Orivox" }] }),
  component: Presentations,
});

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
};

const ROTATIONS = [-1.2, 0.8, -0.6, 1.0, -0.4, 0.9];

function Presentations() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ["presentations", user?.id],
    queryFn: () => getPresentations(user!.id),
    enabled: !!user?.id,
  });

  return (
    <div className="h-full w-full overflow-y-auto px-6 py-10 md:px-10 md:py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
              style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
            >
              📚 Your collection
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl font-bold text-[#2d2d2d]"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              My Decks{" "}
              {!isLoading && (
                <span className="text-2xl text-[#6b6460]">({presentations.length})</span>
              )}
            </motion.h1>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: "" } })}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold bg-[#ff4d4d] text-white border-[3px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <Plus size={16} strokeWidth={2.5} /> New deck
          </motion.button>
        </header>

        <div className="border-t-[2px] border-dashed border-[#2d2d2d]" />

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div
              className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-3xl animate-gentle-bounce shadow-[3px_3px_0px_0px_#2d2d2d]"
              style={{ borderRadius: "50%" }}
            >
              ✏️
            </div>
            <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Loading your decks...
            </p>
          </div>
        ) : presentations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center text-center py-20 px-8 bg-white border-[3px] border-dashed border-[#2d2d2d]"
            style={{ borderRadius: R.md }}
          >
            <div
              className="w-20 h-20 bg-[#fff9c4] border-[3px] border-[#2d2d2d] flex items-center justify-center mb-5 shadow-[4px_4px_0px_0px_#2d2d2d] animate-wiggle"
              style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
            >
              <PresIcon className="w-9 h-9 text-[#2d2d2d]" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
              No decks yet! 👀
            </h2>
            <p className="mt-2 text-base text-[#6b6460] max-w-sm" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Head back home, type an idea, and your first deck will live here in under 30 seconds.
            </p>
            <Link
              to="/home"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              ← Go create one
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {presentations.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
              >
                <Link to="/workspace/$id" params={{ id: p.id }} className="group block">
                  <motion.div
                    whileHover={{ rotate: 0, y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="relative bg-white border-[3px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] group-hover:shadow-[6px_6px_0px_0px_#ff4d4d] transition-shadow"
                    style={{ borderRadius: R.card }}
                  >
                    {/* Tape */}
                    <div
                      className="absolute -top-3 left-1/2 w-10 h-4 bg-gray-300/60 border border-dashed border-gray-400/50"
                      style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1deg)" }}
                    />

                    {/* Slide preview area */}
                    <div
                      className="aspect-video bg-[#fdfbf7] border-b-[2px] border-dashed border-[#2d2d2d] flex items-center justify-center relative overflow-hidden"
                      style={{ borderRadius: `${R.card.split("/")[0].trim().split(" ").slice(0, 2).join(" ")} 0 0` }}
                    >
                      {/* Decorative slide mockup lines */}
                      <div className="absolute inset-4 flex flex-col gap-2 opacity-30">
                        <div className="h-2 bg-[#2d2d2d]/30 w-3/4" style={{ borderRadius: "2px" }} />
                        <div className="h-1.5 bg-[#2d2d2d]/20 w-1/2" style={{ borderRadius: "2px" }} />
                        <div className="flex-1 flex gap-2 mt-1">
                          <div className="flex-1 bg-[#2d2d2d]/10" style={{ borderRadius: "3px" }} />
                          <div className="flex-1 bg-[#2d2d2d]/10" style={{ borderRadius: "3px" }} />
                        </div>
                      </div>
                      <div
                        className="relative z-10 px-3 py-1 text-xs bg-[#fff9c4] border-[1.5px] border-[#2d2d2d]"
                        style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
                      >
                        {p.category}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h3
                        className="text-sm font-bold text-[#2d2d2d] line-clamp-2 group-hover:text-[#ff4d4d] transition-colors"
                        style={{ fontFamily: "Kalam, cursive" }}
                      >
                        {p.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
                          <Clock size={11} strokeWidth={2.5} />
                          {p.updated}
                        </div>
                        <ExternalLink
                          size={13}
                          strokeWidth={2.5}
                          className="text-[#6b6460] opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
