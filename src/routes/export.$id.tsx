import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, FileText, Presentation, Link2, Check, Copy } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/export/$id")({
  head: () => ({ meta: [{ title: "Export — Orivox" }] }),
  component: Export,
});

type Fmt = "pdf" | "pptx" | "link";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

function Export() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  const { id } = Route.useParams();
  const [fmt, setFmt] = useState<Fmt>("pdf");
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const start = () => {
    setState("working");
    setTimeout(() => setState("done"), 1600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/present/$id"
            params={{ id }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Viewer
          </Link>
          <div className="mx-2 h-4 w-px bg-border" />
          <Logo showWord={false} />
          <div className="text-sm font-medium">Export</div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Export your presentation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a format. Orivox handles the rest.
        </p>

        <div className="mt-6 grid gap-2 md:grid-cols-3">
          {(
            [
              { id: "pdf", label: "PDF", icon: FileText, desc: "Print-ready" },
              { id: "pptx", label: "PPTX", icon: Presentation, desc: "PowerPoint" },
              { id: "link", label: "Share link", icon: Link2, desc: "View in browser" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFmt(f.id);
                setState("idle");
                setCopied(false);
              }}
              className={`glass rounded-2xl p-4 text-left transition ${
                fmt === f.id
                  ? "border-electric/60 ring-1 ring-electric/50"
                  : "hover:border-white/20"
              }`}
            >
              <f.icon className="h-5 w-5 text-electric" />
              <div className="mt-3 text-sm font-medium">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </button>
          ))}
        </div>

        <div className="glass mt-6 flex flex-col items-center rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  {fmt === "pdf" && <FileText className="h-6 w-6 text-electric" />}
                  {fmt === "pptx" && <Presentation className="h-6 w-6 text-electric" />}
                  {fmt === "link" && <Link2 className="h-6 w-6 text-electric" />}
                </div>
                <button
                  onClick={start}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  {fmt === "link" ? "Generate link" : `Export as ${fmt.toUpperCase()}`}
                </button>
              </motion.div>
            )}
            {state === "working" && (
              <motion.div
                key="working"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="relative mx-auto mb-4 h-14 w-14">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-electric/30" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/20">
                    <FileText className="h-6 w-6 text-electric" />
                  </div>
                </div>
                <div className="text-sm">Preparing your file…</div>
                <div className="mx-auto mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full bg-electric"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.4 }}
                  />
                </div>
              </motion.div>
            )}
            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <Check className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-sm font-medium">Ready to download</div>
                {fmt === "link" ? (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] p-2 text-xs">
                    <span className="flex-1 truncate px-2 font-mono text-muted-foreground">
                      orivox.app/p/{id}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`https://orivox.app/p/${id}`);
                        setCopied(true);
                      }}
                      className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 transition hover:bg-white/10"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90">
                    Download .{fmt}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
