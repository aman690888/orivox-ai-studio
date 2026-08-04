import { motion, AnimatePresence } from "motion/react";
import { History, X, Sparkles } from "lucide-react";

interface PromptHistoryDropdownProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  onClear: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function PromptHistoryDropdown({
  prompts,
  onSelect,
  onClear,
  isOpen,
  setIsOpen,
}: PromptHistoryDropdownProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#6b6460] hover:text-[#2d2d2d] transition-colors"
        style={{ fontFamily: "Kalam, cursive" }}
      >
        <History className="w-3.5 h-3.5" /> Recent
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full mt-2 left-0 w-64 bg-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] z-50 overflow-hidden"
            style={{ borderRadius: "8px 24px 12px 24px / 24px 12px 24px 8px" }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b-[2px] border-dashed border-[#2d2d2d] bg-[#fdfbf7]">
              <span
                className="text-xs font-bold text-[#2d2d2d]"
                style={{ fontFamily: "Kalam, cursive" }}
              >
                Recent Prompts
              </span>
              <button
                onClick={onClear}
                className="text-[10px] text-[#ff4d4d] hover:underline"
                style={{ fontFamily: "Patrick Hand, cursive" }}
              >
                Clear
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelect(p);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#2d2d2d] hover:bg-[#fff9c4] border-b-[1.5px] border-dashed border-[#2d2d2d]/20 last:border-b-0 transition-colors"
                  style={{ fontFamily: "Patrick Hand, cursive" }}
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#2d5da1]" />
                    <span className="line-clamp-2">{p}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
