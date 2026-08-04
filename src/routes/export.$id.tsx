import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  FileText,
  Presentation,
  Link2,
  Check,
  Copy,
  Download,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentation } from "@/lib/database/presentations";
import { getSlides } from "@/lib/database/slides";
import { Slide } from "@/lib/mock";

export const Route = createFileRoute("/export/$id")({
  head: () => ({ meta: [{ title: "Export — Orivox" }] }),
  component: Export,
});

type Fmt = "pdf" | "pptx" | "link";

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
  input: "4px 18px 4px 16px / 18px 4px 16px 4px",
};

// ─── Real PPTX generator ───────────────────────────────────────────────────────
async function exportPPTX(slides: Slide[], title: string): Promise<void> {
  // Dynamic import to keep bundle small
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE"; // 16:9

  for (const slide of slides) {
    const pSlide = pptx.addSlide();

    // Background
    pSlide.background = { color: "0D0D0D" };

    // Title
    pSlide.addText(slide.title, {
      x: 0.5,
      y: 0.4,
      w: 9.0,
      h: 1.2,
      fontSize: slide.kind === "cover" ? 36 : 28,
      bold: true,
      color: "FAFAFA",
      fontFace: "Calibri",
      wrap: true,
    });

    // Bullets / body content
    if (slide.bullets && slide.bullets.length > 0) {
      const bulletText = slide.bullets.map((b) => ({
        text: b,
        options: { bullet: true, fontSize: 16, color: "CCCCCC", paraSpaceAfter: 8 },
      }));
      pSlide.addText(bulletText, {
        x: 0.5,
        y: 1.8,
        w: 9.0,
        h: 4.5,
        fontFace: "Calibri",
        valign: "top",
        wrap: true,
      });
    }

    // Speaker notes
    if (slide.notes) {
      pSlide.addNotes(slide.notes);
    }

    // Slide number badge (bottom right)
    const idx = slides.indexOf(slide) + 1;
    pSlide.addText(`${idx} / ${slides.length}`, {
      x: 8.5,
      y: 6.8,
      w: 1.0,
      h: 0.3,
      fontSize: 9,
      color: "666666",
      align: "right",
    });
  }

  await pptx.writeFile({ fileName: `${title.replace(/[^a-z0-9]/gi, "_")}.pptx` });
}

// ─── Real PDF generator (uses browser print → PDF) ────────────────────────────
async function exportPDF(slides: Slide[], title: string): Promise<void> {
  // Open a hidden print window with all slides rendered
  const printWindow = window.open("", "_blank", "width=1280,height=720");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups for this site and try again.");
  }

  const slidesHTML = slides
    .map(
      (s, i) => `
      <div class="slide">
        <div class="slide-num">${i + 1} / ${slides.length}</div>
        <h1 class="title">${escapeHtml(s.title)}</h1>
        ${
          s.bullets && s.bullets.length > 0
            ? `<ul class="bullets">${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
            : ""
        }
        ${s.notes ? `<div class="notes">Speaker notes: ${escapeHtml(s.notes)}</div>` : ""}
      </div>
    `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(title)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0d0d0d; color: #fafafa; }
        .slide {
          width: 297mm;
          height: 167mm;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 32px 48px;
          background: linear-gradient(135deg, #111 0%, #1a1a2e 100%);
          position: relative;
          overflow: hidden;
        }
        .slide:last-child { page-break-after: avoid; }
        .slide-num {
          position: absolute;
          bottom: 16px;
          right: 24px;
          font-size: 10px;
          color: #555;
        }
        .title {
          font-size: 32px;
          font-weight: 700;
          color: #fafafa;
          line-height: 1.2;
          margin-bottom: 24px;
        }
        .bullets {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bullets li {
          font-size: 16px;
          color: #ccc;
          line-height: 1.5;
          padding-left: 20px;
          position: relative;
        }
        .bullets li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #ff4d4d;
        }
        .notes {
          margin-top: 24px;
          font-size: 11px;
          color: #555;
          border-top: 1px solid #333;
          padding-top: 12px;
          font-style: italic;
        }
        @media print {
          body { background: #0d0d0d; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 landscape; margin: 0; }
        }
      </style>
    </head>
    <body>${slidesHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 600);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Format options ────────────────────────────────────────────────────────────
const FORMATS = [
  {
    id: "pptx" as Fmt,
    label: "PPTX",
    emoji: "📊",
    desc: "PowerPoint file",
    tag: "Most popular",
    tagColor: "#ff4d4d",
  },
  {
    id: "pdf" as Fmt,
    label: "PDF",
    emoji: "📄",
    desc: "Print-ready PDF",
    tag: "Print-friendly",
    tagColor: "#2d5da1",
  },
  {
    id: "link" as Fmt,
    label: "Share link",
    emoji: "🔗",
    desc: "View in browser",
    tag: "Free",
    tagColor: "#2d8a5b",
  },
] as const;

// ─── Export Component ──────────────────────────────────────────────────────────
function Export() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useParams();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const { data: dbPresentation } = useQuery({
    queryKey: ["presentation", id],
    queryFn: () => getPresentation(id),
    enabled: !!user?.id,
  });

  const { data: dbSlides = [] } = useQuery({
    queryKey: ["slides", id],
    queryFn: () => getSlides(id),
    enabled: !!user?.id,
  });

  const [fmt, setFmt] = useState<Fmt>("pptx");
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#fdfbf7", backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      >
        <div
          className="flex flex-col items-center gap-4 p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d]"
          style={{ borderRadius: R.card }}
        >
          <div className="text-3xl animate-bounce">📦</div>
          <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const presentationTitle = dbPresentation?.title ?? "Orivox Presentation";

  const handleExport = async () => {
    if (dbSlides.length === 0) {
      setErrorMsg("No slides found in this presentation.");
      setState("error");
      return;
    }

    setState("working");
    setErrorMsg("");

    try {
      if (fmt === "pptx") {
        await exportPPTX(dbSlides, presentationTitle);
        setState("done");
      } else if (fmt === "pdf") {
        await exportPDF(dbSlides, presentationTitle);
        setState("done");
      } else {
        // Share link — just generate the URL
        setState("done");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Export failed. Please try again.");
      setState("error");
    }
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/present/${id}`
    : `https://orivox-one.vercel.app/present/${id}`;

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#fdfbf7", backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)", backgroundSize: "24px 24px", fontFamily: "Patrick Hand, cursive", color: "#2d2d2d" }}
    >
      {/* ── Header ── */}
      <header className="flex h-[60px] shrink-0 items-center justify-between bg-[#fdfbf7] border-b-[3px] border-dashed border-[#2d2d2d] px-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/present/$id"
            params={{ id }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold border-[2px] border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Viewer
          </Link>
          <div className="h-4 w-[2px] bg-[#2d2d2d]/20" />
          <h1 className="text-sm font-bold text-[#2d2d2d] truncate max-w-[240px]" style={{ fontFamily: "Kalam, cursive" }}>
            {presentationTitle}
          </h1>
        </div>
        <div
          className="px-3 py-1 text-xs font-bold bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
          style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
        >
          {dbSlides.length} slide{dbSlides.length !== 1 ? "s" : ""}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-8">

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
              style={{ borderRadius: R.tag }}
            >
              📦 Ready to export
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-bold text-[#2d2d2d]"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              Export your deck
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-base text-[#6b6460]"
            >
              Pick a format below and download in seconds.
            </motion.p>
          </div>

          {/* Format selector */}
          <div className="grid grid-cols-3 gap-4">
            {FORMATS.map((f, i) => (
              <motion.button
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => { setFmt(f.id); setState("idle"); setCopied(false); setErrorMsg(""); }}
                className={`relative flex flex-col gap-3 p-5 border-[3px] text-left transition-all duration-100 ${
                  fmt === f.id
                    ? "border-[#ff4d4d] bg-white shadow-[5px_5px_0px_0px_#ff4d4d]"
                    : "border-[#2d2d2d] bg-white shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
                style={{ borderRadius: R.md }}
              >
                {/* Tape */}
                <div
                  className="absolute -top-3 left-1/2 w-10 h-4 bg-gray-300/60 border border-dashed border-gray-400/50"
                  style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1deg)" }}
                />

                {/* Active checkmark */}
                {fmt === f.id && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 bg-[#ff4d4d] flex items-center justify-center"
                    style={{ borderRadius: "50%" }}
                  >
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </div>
                )}

                <span className="text-3xl">{f.emoji}</span>
                <div>
                  <div className="text-base font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                    {f.label}
                  </div>
                  <div className="text-xs text-[#6b6460] mt-0.5">{f.desc}</div>
                </div>
                <div
                  className="self-start px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: f.tagColor, borderRadius: "3px", fontFamily: "Kalam, cursive" }}
                >
                  {f.tag}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Action card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative bg-white border-[3px] border-[#2d2d2d] p-8 shadow-[5px_5px_0px_0px_#2d2d2d]"
            style={{ borderRadius: R.card }}
          >
            {/* Tape */}
            <div
              className="absolute -top-4 left-8 w-12 h-5 bg-gray-300/60 border border-dashed border-gray-400/50"
              style={{ borderRadius: "2px", transform: "rotate(-1.5deg)" }}
            />

            <AnimatePresence mode="wait">

              {/* ── Idle ── */}
              {state === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 text-center"
                >
                  {fmt === "pptx" && (
                    <>
                      <div className="text-5xl">📊</div>
                      <div>
                        <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                          Export as PowerPoint
                        </p>
                        <p className="mt-1 text-sm text-[#6b6460]">
                          Downloads a real <code className="bg-[#e5e0d8] px-1 py-0.5 rounded text-xs">.pptx</code> file with all {dbSlides.length} slides, bullets, and speaker notes.
                        </p>
                      </div>
                    </>
                  )}
                  {fmt === "pdf" && (
                    <>
                      <div className="text-5xl">📄</div>
                      <div>
                        <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                          Export as PDF
                        </p>
                        <p className="mt-1 text-sm text-[#6b6460]">
                          Opens a print dialog — choose "Save as PDF" in your browser. Renders all {dbSlides.length} slides in landscape A4.
                        </p>
                      </div>
                    </>
                  )}
                  {fmt === "link" && (
                    <>
                      <div className="text-5xl">🔗</div>
                      <div>
                        <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                          Share a link
                        </p>
                        <p className="mt-1 text-sm text-[#6b6460]">
                          Anyone with the link can view your presentation in the browser — no account needed.
                        </p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 px-7 py-3 text-base font-bold bg-[#ff4d4d] text-white border-[3px] border-[#2d2d2d] shadow-[5px_5px_0px_0px_#2d2d2d] hover:shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all duration-100"
                    style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                  >
                    <Download size={16} strokeWidth={2.5} />
                    {fmt === "link" ? "Generate link" : `Export as ${fmt.toUpperCase()}`}
                  </button>
                </motion.div>
              )}

              {/* ── Working ── */}
              {state === "working" && (
                <motion.div key="working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 text-center"
                >
                  <div
                    className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center shadow-[3px_3px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                  >
                    <Loader2 size={28} className="animate-spin text-[#ff4d4d]" strokeWidth={2.5} />
                  </div>
                  <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                    Preparing your {fmt.toUpperCase()}...
                  </p>
                  {/* Progress bar */}
                  <div className="w-full max-w-xs bg-[#e5e0d8] border-[2px] border-[#2d2d2d] overflow-hidden" style={{ height: "12px", borderRadius: R.tag }}>
                    <motion.div
                      className="h-full bg-[#ff4d4d]"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Done ── */}
              {state === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-5 text-center w-full"
                >
                  <div
                    className="w-16 h-16 bg-[#e5f7ed] border-[2px] border-[#2d8a5b] flex items-center justify-center shadow-[3px_3px_0px_0px_#2d8a5b]"
                    style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                  >
                    <Check size={28} className="text-[#2d8a5b]" strokeWidth={2.5} />
                  </div>

                  {fmt === "link" ? (
                    <>
                      <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                        Your link is ready! 🎉
                      </p>
                      <div
                        className="flex w-full max-w-sm items-center gap-2 bg-[#fdfbf7] border-[2px] border-[#2d2d2d] px-3 py-2 shadow-[2px_2px_0px_0px_#2d2d2d]"
                        style={{ borderRadius: R.input }}
                      >
                        <span className="flex-1 truncate text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
                          {shareUrl}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(shareUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-[2px] border-[#2d2d2d] transition-all duration-100 ${
                            copied ? "bg-[#2d8a5b] text-white" : "bg-white text-[#2d2d2d] hover:bg-[#e5e0d8]"
                          }`}
                          style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                        >
                          {copied ? <><Check size={11} strokeWidth={2.5} /> Copied!</> : <><Copy size={11} strokeWidth={2.5} /> Copy</>}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                        {fmt === "pdf" ? "PDF export sent! 🎉" : "Download started! 🎉"}
                      </p>
                      <p className="text-sm text-[#6b6460]">
                        {fmt === "pdf"
                          ? "Check your browser's print dialog. Select "Save as PDF" to download."
                          : "Your .pptx file is downloading. Open it in PowerPoint or Google Slides."}
                      </p>
                    </>
                  )}

                  <button
                    onClick={() => { setState("idle"); setCopied(false); }}
                    className="mt-1 px-5 py-2 text-sm font-bold bg-white text-[#2d2d2d] border-[2px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                    style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                  >
                    ← Export again
                  </button>
                </motion.div>
              )}

              {/* ── Error ── */}
              {state === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-5 text-center"
                >
                  <div
                    className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#ff4d4d] flex items-center justify-center shadow-[3px_3px_0px_0px_#ff4d4d]"
                    style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                  >
                    <AlertTriangle size={28} className="text-[#ff4d4d]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
                      Export failed 😬
                    </p>
                    <p className="mt-1 text-sm text-[#6b6460]">{errorMsg}</p>
                  </div>
                  <button
                    onClick={() => { setState("idle"); setErrorMsg(""); }}
                    className="px-5 py-2 text-sm font-bold bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                    style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                  >
                    Try again
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
