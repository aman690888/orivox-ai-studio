import { motion, AnimatePresence } from "motion/react";
import { WifiOff, AlertCircle, RefreshCw, X, CheckCircle, Clock } from "lucide-react";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";

interface GenerationOverlayProps {
  progress: ReturnType<typeof useGenerationProgress>;
  onRetry: () => void;
}

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

function ProgressRing({
  pct,
  label,
  color,
  icon,
}: {
  pct: number;
  label: string;
  color: string;
  icon: string;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="relative w-18 h-18 sm:w-24 sm:h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="#e5e0d8"
            strokeWidth="6"
            className="opacity-50"
          />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">
          {pct === 100 ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#2d8a5b]">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            </motion.div>
          ) : (
            <span>{icon}</span>
          )}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs sm:text-sm font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
          {label}
        </div>
        <div className="text-[10px] sm:text-xs text-[#6b6460] font-mono">{pct}%</div>
      </div>
    </div>
  );
}

export function GenerationOverlay({ progress, onRetry }: GenerationOverlayProps) {
  const {
    status,
    phasePct,
    elapsedMs,
    estimatedMs,
    chartPct,
    imagePct,
    diagramPct,
    canCancel,
    cancel,
    networkError,
    timeline,
  } = progress;

  if (status === "idle" || status === "success") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfbf7]/95 backdrop-blur-sm p-4 overflow-y-auto"
        style={{
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          fontFamily: "Patrick Hand, cursive",
        }}
      >
        {networkError && (
          <div
            className="absolute top-0 left-0 right-0 bg-[#ff4d4d] text-white py-2 px-4 flex items-center justify-center gap-2 font-bold shadow-md z-10"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            <WifiOff className="w-4 h-4" /> You're offline. Reconnecting...
          </div>
        )}

        <div className="w-full max-w-2xl px-4 sm:px-6 flex flex-col items-center gap-6 sm:gap-8">
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-3 sm:gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fff9c4] border-[3px] border-[#2d2d2d] flex items-center justify-center text-3xl sm:text-4xl shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
            >
              {status === "error" ? "💥" : status === "timeout" ? "⏱️" : "✨"}
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              {status === "error"
                ? "Generation Failed"
                : status === "timeout"
                  ? "This is taking longer than expected"
                  : "Generating your presentation..."}
            </h1>

            {(status === "generating" || status === "queued") && (
              <div className="flex items-center gap-3 sm:gap-4 text-[#6b6460]">
                <div
                  className="flex items-center gap-1.5 font-mono text-base sm:text-lg bg-white px-3 py-1 border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#e5e0d8]"
                  style={{ borderRadius: "8px" }}
                >
                  <Clock className="w-4 h-4 text-[#2d5da1]" />
                  <span>{formatTime(elapsedMs)}</span>
                </div>
                <div className="text-xs sm:text-sm">Est. remaining: {formatTime(estimatedMs)}</div>
              </div>
            )}
          </div>

          {status === "error" && (
            <div
              className="p-4 bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#ff4d4d] flex flex-col items-center gap-4 text-center max-w-sm"
              style={{ borderRadius: "8px 24px 12px 24px / 24px 12px 24px 8px" }}
            >
              <div
                className="text-[#ff4d4d] flex items-center gap-2 font-bold"
                style={{ fontFamily: "Kalam, cursive" }}
              >
                <AlertCircle className="w-5 h-5" /> Something went wrong
              </div>
              <p className="text-sm">We hit a snag generating your slides. Please try again.</p>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-[#ff4d4d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                style={{
                  borderRadius: "4px 22px 6px 18px / 22px 6px 18px 4px",
                  fontFamily: "Kalam, cursive",
                }}
              >
                <RefreshCw className="w-4 h-4" strokeWidth={3} /> Retry
              </button>
            </div>
          )}

          {status === "timeout" && (
            <div
              className="p-4 bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#ff4d4d] flex flex-col items-center gap-4 text-center max-w-sm"
              style={{ borderRadius: "8px 24px 12px 24px / 24px 12px 24px 8px" }}
            >
              <p className="text-sm">
                It's taking over 2 minutes. You can keep waiting, retry, or cancel.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#ff4d4d] text-white border-[2.5px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  style={{
                    borderRadius: "4px 22px 6px 18px / 22px 6px 18px 4px",
                    fontFamily: "Kalam, cursive",
                  }}
                >
                  <RefreshCw className="w-4 h-4" strokeWidth={3} /> Retry
                </button>
                <button
                  onClick={cancel}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-[#2d2d2d] border-[2.5px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  style={{
                    borderRadius: "4px 22px 6px 18px / 22px 6px 18px 4px",
                    fontFamily: "Kalam, cursive",
                  }}
                >
                  <X className="w-4 h-4" strokeWidth={3} /> Cancel
                </button>
              </div>
            </div>
          )}

          {(status === "generating" || status === "queued") && (
            <>
              {/* Phase Cards */}
              <div className="flex gap-4 sm:gap-8 justify-center w-full">
                <ProgressRing pct={imagePct} label="Slides" color="#2d5da1" icon="🖼️" />
                <ProgressRing pct={chartPct} label="Charts" color="#e87a2d" icon="📊" />
                <ProgressRing pct={diagramPct} label="Diagrams" color="#8b5cf6" icon="🔀" />
              </div>

              {/* Timeline */}
              <div
                className="w-full max-w-md bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#e5e0d8] p-4 max-h-48 overflow-y-auto"
                style={{ borderRadius: "6px 38px 6px 42px / 38px 6px 42px 6px" }}
              >
                <div className="space-y-3">
                  {timeline.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 text-sm ${item.status === "active" ? "text-[#2d2d2d] font-bold" : item.status === "done" ? "text-[#6b6460]" : "text-[#6b6460]/40"}`}
                    >
                      <div className="w-5 flex justify-center">
                        {item.status === "done" && (
                          <CheckCircle className="w-4 h-4 text-[#2d8a5b]" />
                        )}
                        {item.status === "active" && (
                          <span className="w-2.5 h-2.5 bg-[#ff4d4d] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,77,77,0.8)]" />
                        )}
                        {item.status === "pending" && (
                          <span className="w-1.5 h-1.5 bg-[#2d2d2d]/20 rounded-full" />
                        )}
                      </div>
                      <span className={item.status === "done" ? "line-through opacity-70" : ""}>
                        {item.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Button */}
              {canCancel && (
                <button
                  onClick={cancel}
                  className="mt-4 px-6 py-2.5 text-sm font-bold bg-white text-[#2d2d2d] border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#ffeaea] hover:text-[#ff4d4d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                  style={{
                    borderRadius: "4px 22px 6px 18px / 22px 6px 18px 4px",
                    fontFamily: "Kalam, cursive",
                  }}
                >
                  Cancel Generation
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
