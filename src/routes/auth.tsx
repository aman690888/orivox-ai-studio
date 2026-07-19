import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Orivox" },
      { name: "description", content: "Sign in or create your Orivox account." },
    ],
  }),
  component: Auth,
});

type Mode = "signup" | "login";
type SignupStep = "email" | "confirm-sent" | "password";
type LoginStep = "credentials" | "forgot" | "forgot-sent";

function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>("email");
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/home" });
    }
  }, [user, loading, navigate]);

  const resetAll = (m: Mode) => {
    setMode(m);
    setSignupStep("email");
    setLoginStep("credentials");
    setAuthError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleOAuth = async () => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message || "Failed Google Authentication");
    }
  };

  const handleEmailStep = () => {
    setAuthError(null);
    setSignupStep("password");
  };

  const handleSignUp = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) throw error;
      setSignupStep("confirm-sent");
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message || "Sign up failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate({ to: "/home" });
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      setLoginStep("forgot-sent");
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message || "Failed to send reset link.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_at_50%_20%,color-mix(in_oklab,var(--electric)_15%,transparent),transparent)]" />
      <FloatingOrbs />
      <Link to="/" className="absolute left-6 top-6">
        <Logo />
      </Link>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass relative w-full max-w-md overflow-hidden rounded-2xl p-6"
      >
        {/* Error notice */}
        {authError && (
          <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/25">
            {authError}
          </div>
        )}

        {/* Tabs — only visible on the entry steps */}
        {((mode === "signup" && signupStep === "email") ||
          (mode === "login" && loginStep === "credentials")) && (
          <div className="mb-6 flex rounded-lg bg-white/5 p-1 text-sm">
            {(["signup", "login"] as const).map((t) => (
              <button
                key={t}
                onClick={() => resetAll(t)}
                className="relative flex-1 rounded-md py-1.5 text-center"
              >
                {mode === t && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-md bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative ${mode === t ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {t === "signup" ? "Create account" : "Log in"}
                </span>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "signup" && signupStep === "email" && (
            <StepShell key="signup-email">
              <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Start turning ideas into presentations.
              </p>

              <GoogleButton onClick={handleOAuth} label="Sign up with Google" />
              <Divider />

              <EmailInput email={email} setEmail={setEmail} />
              <PrimaryButton
                disabled={!isValidEmail(email) || actionLoading}
                onClick={handleEmailStep}
                label="Continue with email"
              />
            </StepShell>
          )}

          {mode === "signup" && signupStep === "password" && (
            <StepShell key="signup-password">
              <BackButton onClick={() => setSignupStep("email")} />
              <h1 className="text-xl font-semibold tracking-tight">Create a password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                You'll use this to sign in next time.
              </p>
              <PasswordFields
                pw={password}
                setPw={setPassword}
                confirm={confirmPassword}
                setConfirm={setConfirmPassword}
                onSubmit={handleSignUp}
                disabled={actionLoading}
              />
            </StepShell>
          )}

          {mode === "signup" && signupStep === "confirm-sent" && (
            <StepShell key="confirm-sent">
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-electric/15">
                  <Check className="h-5 w-5 text-electric" />
                </div>
                <h1 className="mt-4 text-xl font-semibold tracking-tight">Check your email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've sent a verification link to <span className="text-foreground">{email}</span>
                  . Please verify your email before logging in.
                </p>
                <button
                  onClick={() => resetAll("login")}
                  className="mt-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </button>
              </div>
            </StepShell>
          )}

          {mode === "login" && loginStep === "credentials" && (
            <StepShell key="login">
              <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to Orivox.</p>

              <GoogleButton onClick={handleOAuth} label="Continue with Google" />
              <Divider />

              <EmailInput email={email} setEmail={setEmail} />
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Password</label>
                  <button
                    onClick={() => setLoginStep("forgot")}
                    className="text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-white/25 focus:bg-white/[0.05]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <PrimaryButton
                disabled={!isValidEmail(email) || !password || actionLoading}
                onClick={handleLogin}
                label="Continue"
              />
            </StepShell>
          )}

          {mode === "login" && loginStep === "forgot" && (
            <StepShell key="forgot">
              <BackButton onClick={() => setLoginStep("credentials")} />
              <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll email you a secure reset link.
              </p>
              <EmailInput email={email} setEmail={setEmail} className="mt-6" />
              <PrimaryButton
                disabled={!isValidEmail(email) || actionLoading}
                onClick={handleResetPassword}
                label="Send reset link"
              />
            </StepShell>
          )}

          {mode === "login" && loginStep === "forgot-sent" && (
            <StepShell key="forgot-sent">
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-electric/15">
                  <Check className="h-5 w-5 text-electric" />
                </div>
                <h1 className="mt-4 text-xl font-semibold tracking-tight">Check your email</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  If <span className="text-foreground">{email}</span> exists, a reset link is on its
                  way.
                </p>
                <button
                  onClick={() => setLoginStep("credentials")}
                  className="mt-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </button>
              </div>
            </StepShell>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ---------- Shared pieces ---------- */

function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-4 flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft className="h-3 w-3" /> Back
    </button>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function EmailInput({
  email,
  setEmail,
  className = "",
}: {
  email: string;
  setEmail: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className || "mt-1"}>
      <label className="mb-1.5 block text-xs text-muted-foreground">Email</label>
      <input
        type="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-white/25 focus:bg-white/[0.05]"
      />
    </div>
  );
}

function PrimaryButton({
  disabled,
  onClick,
  label,
}: {
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white/[0.03] py-2.5 text-sm transition hover:border-white/20 hover:bg-white/5"
    >
      <GoogleIcon /> {label}
    </button>
  );
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/* ---------- Password ---------- */

function PasswordFields({
  pw,
  setPw,
  confirm,
  setConfirm,
  onSubmit,
  disabled,
}: {
  pw: string;
  setPw: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const strength = useMemo(() => scorePassword(pw), [pw]);
  const match = pw.length > 0 && pw === confirm;
  const canSubmit = strength.score >= 2 && match;

  return (
    <div className="mt-6 space-y-3">
      <div className="relative">
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25 focus:bg-white/[0.05]"
        />
      </div>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm password"
        className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25 focus:bg-white/[0.05]"
      />

      <div>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={false}
                animate={{
                  width: i < strength.score ? "100%" : "0%",
                  backgroundColor: strength.color,
                }}
                transition={{ duration: 0.25 }}
                className="h-full rounded-full"
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{pw.length === 0 ? "At least 8 characters" : strength.label}</span>
          {confirm.length > 0 && (
            <span className={match ? "text-emerald-400" : "text-rose-400"}>
              {match ? "Passwords match" : "Passwords don't match"}
            </span>
          )}
        </div>
      </div>

      <PrimaryButton disabled={!canSubmit || disabled} onClick={onSubmit} label="Create account" />
    </div>
  );
}

function scorePassword(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too short", color: "#f43f5e" },
    { label: "Weak", color: "#f97316" },
    { label: "Fair", color: "#eab308" },
    { label: "Strong", color: "#10b981" },
    { label: "Excellent", color: "#10b981" },
  ];
  return { score: s, ...map[s] };
}

/* ---------- Decoration ---------- */

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-electric/10 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-violet/10 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.5 12.3c0-.8-.1-1.4-.2-2.1H12v3.9h5.9c-.1.9-.8 2.4-2.3 3.4l-.1.1 3.3 2.5.2.1c2.1-1.9 3.3-4.8 3.3-7.9"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-.9.6-2.2 1.1-3.8 1.1-2.9 0-5.4-1.9-6.3-4.6l-.1 0-3.4 2.6-.1.1C3.9 20.4 7.6 23 12 23"
      />
      <path
        fill="#FBBC05"
        d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.5.3-2.1V7.2l-3.5-.1C1.4 8.7 1 10.3 1 12s.4 3.3 1.1 4.9L5.7 14"
      />
      <path
        fill="#EB4335"
        d="M12 5.4c2.1 0 3.5.9 4.3 1.7l3.1-3C17.5 2.4 15 1 12 1 7.6 1 3.9 3.6 2.1 7.1L5.7 10c.9-2.7 3.4-4.6 6.3-4.6"
      />
    </svg>
  );
}
