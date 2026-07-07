import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Orivox" },
      { name: "description", content: "Sign in or create your Orivox account." },
    ],
  }),
  component: Auth,
});

type Step = "form" | "otp" | "password" | "forgot";

function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_at_50%_20%,color-mix(in_oklab,var(--electric)_15%,transparent),transparent)]" />
      <Link to="/" className="absolute left-6 top-6"><Logo /></Link>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass relative w-full max-w-md overflow-hidden rounded-2xl p-6"
      >
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6 flex rounded-lg bg-white/5 p-1 text-sm">
                {(["signup", "login"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="relative flex-1 rounded-md py-1.5 text-center"
                  >
                    {tab === t && (
                      <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-md bg-white/[0.08]" />
                    )}
                    <span className={`relative ${tab === t ? "text-foreground" : "text-muted-foreground"}`}>
                      {t === "signup" ? "Sign up" : "Log in"}
                    </span>
                  </button>
                ))}
              </div>

              <h1 className="text-xl font-semibold tracking-tight">
                {tab === "signup" ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Continue to Orivox.</p>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white/[0.03] py-2.5 text-sm transition hover:bg-white/5">
                <GoogleIcon /> Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
              </div>

              <label className="mb-1.5 block text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-white/25"
              />

              <button
                onClick={() => setStep("otp")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>

              {tab === "login" && (
                <button onClick={() => setStep("forgot")} className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-foreground">
                  Forgot password?
                </button>
              )}
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep("form")} className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
              <p className="mt-1 text-sm text-muted-foreground">We sent a 6-digit code to {email || "you"}.</p>
              <div className="mt-6 flex justify-between gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    className="h-12 w-full rounded-lg border border-border bg-white/[0.03] text-center text-lg font-medium outline-none transition focus:border-white/30"
                  />
                ))}
              </div>
              <button
                onClick={() => setStep(tab === "signup" ? "password" : "form")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Verify <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === "password" && (
            <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-xl font-semibold tracking-tight">Set a password</h1>
              <p className="mt-1 text-sm text-muted-foreground">You can change this later in settings.</p>
              <input type="password" placeholder="Password" className="mt-6 w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25" />
              <input type="password" placeholder="Confirm password" className="mt-3 w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25" />
              <button
                onClick={() => navigate({ to: "/home" })}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Create account
              </button>
            </motion.div>
          )}

          {step === "forgot" && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep("form")} className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>
              <input type="email" placeholder="you@company.com" className="mt-6 w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25" />
              <button onClick={() => setStep("form")} className="mt-4 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90">
                Send link
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.4-.2-2.1H12v3.9h5.9c-.1.9-.8 2.4-2.3 3.4l-.1.1 3.3 2.5.2.1c2.1-1.9 3.3-4.8 3.3-7.9" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-.9.6-2.2 1.1-3.8 1.1-2.9 0-5.4-1.9-6.3-4.6l-.1 0-3.4 2.6-.1.1C3.9 20.4 7.6 23 12 23" />
      <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.5.3-2.1V7.2l-3.5-.1C1.4 8.7 1 10.3 1 12s.4 3.3 1.1 4.9L5.7 14" />
      <path fill="#EB4335" d="M12 5.4c2.1 0 3.5.9 4.3 1.7l3.1-3C17.5 2.4 15 1 12 1 7.6 1 3.9 3.6 2.1 7.1L5.7 10c.9-2.7 3.4-4.6 6.3-4.6" />
    </svg>
  );
}
