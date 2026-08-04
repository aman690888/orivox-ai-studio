import { motion } from 'motion/react';
import { X, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { GenPhase } from '@/hooks/useGenerationTimeline';

interface AIStatusBarProps {
  status: string;
  phase: GenPhase;
  elapsedMs: number;
  networkError: boolean;
  onCancel: () => void;
}

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const phaseLabels: Record<string, string> = {
  idle: 'Waiting...',
  understanding: 'Understanding prompt...',
  researching: 'Researching topics...',
  outlining: 'Structuring outline...',
  designing: 'Designing slides...',
  charting: 'Generating charts...',
  diagramming: 'Drawing diagrams...',
  noting: 'Writing speaker notes...',
  reviewing: 'Final review...',
  ready: 'Done!',
};

export function AIStatusBar({ status, phase, elapsedMs, networkError, onCancel }: AIStatusBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-[#fdfbf7] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
      style={{ borderRadius: "4px 22px 6px 18px / 22px 6px 18px 4px", fontFamily: "Kalam, cursive" }}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
        <span className="text-[#2d2d2d]">{phaseLabels[phase] || 'Generating...'}</span>
      </div>
      <div className="w-px h-3 bg-[#2d2d2d]/20 mx-1" />
      <div className="text-[#6b6460] w-[35px] text-right font-mono text-[11px] font-bold">
        {formatTime(elapsedMs)}
      </div>
      <div className="w-px h-3 bg-[#2d2d2d]/20 mx-1" />
      {networkError ? (
        <WifiOff className="w-3.5 h-3.5 text-[#ff4d4d]" />
      ) : (
        <Wifi className="w-3.5 h-3.5 text-[#2d8a5b]" />
      )}
      <button 
        onClick={onCancel}
        className="ml-1 p-0.5 rounded-full hover:bg-[#e5e0d8] text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
      >
        <X className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
    </motion.div>
  );
}
