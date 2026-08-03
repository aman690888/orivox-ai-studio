import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
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
        options: { emailRedirectTo: `${window.location.origin}/home` },
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen font-sans items-center justify-center overflow-hidden bg-[#0A0A0A] px-4 selection:bg-neutral-800 selection:text-white">
      {/* Deep blurred abstract background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="absolute top-8 left-8 z-20">
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-8 shadow-2xl backdrop-blur-2xl backdrop-saturate-150">
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {authError}
            </motion.div>
          )}

          {((mode === "signup" && signupStep === "email") ||
            (mode === "login" && loginStep === "credentials")) && (
            <div className="mb-8 flex space-x-4 border-b border-white/[0.08] pb-4">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => resetAll(t)}
                  className={`relative pb-4 -mb-4 text-sm font-medium transition-colors ${
                    mode === t ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                  {mode === t && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "signup" && signupStep === "email" && (
              <StepShell key="signup-email">
                <div className="mb-6">
                  <h1 className="text-xl font-medium tracking-tight text-white">
                    Create an account
                  </h1>
                  <p className="mt-1.5 text-sm text-neutral-400">
                    Enter your email to get started.
                  </p>
                </div>

                <EmailInput email={email} setEmail={setEmail} />
                <PrimaryButton
                  disabled={!isValidEmail(email) || actionLoading}
                  onClick={handleEmailStep}
                  label="Continue with email"
                />

                <Divider />
                <GoogleButton onClick={handleOAuth} label="Continue with Google" />
              </StepShell>
            )}

            {mode === "signup" && signupStep === "password" && (
              <StepShell key="signup-password">
                <div className="mb-6">
                  <h1 className="text-xl font-medium tracking-tight text-white">Set a password</h1>
                  <p className="mt-1.5 text-sm text-neutral-400">
                    Choose a secure password for your account.
                  </p>
                </div>
                <PasswordFields
                  pw={password}
                  setPw={setPassword}
                  confirm={confirmPassword}
                  setConfirm={setConfirmPassword}
                  onSubmit={handleSignUp}
                  disabled={actionLoading}
                />
                <button
                  onClick={() => setSignupStep("email")}
                  className="mt-6 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Back
                </button>
              </StepShell>
            )}

            {mode === "signup" && signupStep === "confirm-sent" && (
              <StepShell key="confirm-sent">
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <Check className="h-5 w-5 text-neutral-300" />
                  </div>
                  <h1 className="mt-5 text-lg font-medium text-white">Check your email</h1>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    We sent a verification link to <br />
                    <span className="font-medium text-white">{email}</span>
                  </p>
                  <button
                    onClick={() => resetAll("login")}
                    className="mt-8 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Return to sign in
                  </button>
                </div>
              </StepShell>
            )}

            {mode === "login" && loginStep === "credentials" && (
              <StepShell key="login">
                <div className="mb-6">
                  <h1 className="text-xl font-medium tracking-tight text-white">Welcome back</h1>
                  <p className="mt-1.5 text-sm text-neutral-400">Sign in to your account.</p>
                </div>

                <div className="space-y-4">
                  <EmailInput email={email} setEmail={setEmail} />
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-neutral-300">Password</label>
                      <button
                        onClick={() => setLoginStep("forgot")}
                        className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <PrimaryButton
                    disabled={!isValidEmail(email) || !password || actionLoading}
                    onClick={handleLogin}
                    label="Sign in"
                  />
                </div>

                <Divider />
                <GoogleButton onClick={handleOAuth} label="Continue with Google" />
              </StepShell>
            )}

            {mode === "login" && loginStep === "forgot" && (
              <StepShell key="forgot">
                <div className="mb-6">
                  <h1 className="text-xl font-medium tracking-tight text-white">Reset password</h1>
                  <p className="mt-1.5 text-sm text-neutral-400">
                    We'll email you a secure reset link.
                  </p>
                </div>
                <EmailInput email={email} setEmail={setEmail} />
                <div className="mt-6">
                  <PrimaryButton
                    disabled={!isValidEmail(email) || actionLoading}
                    onClick={handleResetPassword}
                    label="Send link"
                  />
                </div>
                <button
                  onClick={() => setLoginStep("credentials")}
                  className="mt-6 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Back
                </button>
              </StepShell>
            )}

            {mode === "login" && loginStep === "forgot-sent" && (
              <StepShell key="forgot-sent">
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <Check className="h-5 w-5 text-neutral-300" />
                  </div>
                  <h1 className="mt-5 text-lg font-medium text-white">Check your email</h1>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    If an account exists for <br />
                    <span className="font-medium text-white">{email}</span>, a link is on its way.
                  </p>
                  <button
                    onClick={() => setLoginStep("credentials")}
                    className="mt-8 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Return to sign in
                  </button>
                </div>
              </StepShell>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-4 text-xs text-neutral-600">
      <span className="h-[1px] flex-1 bg-white/10" />
      <span>OR</span>
      <span className="h-[1px] flex-1 bg-white/10" />
    </div>
  );
}

function EmailInput({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-300">Email address</label>
      <input
        type="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/10"
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
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

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
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Password</label>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
        />
      </div>

      <div className="pt-2">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={false}
                animate={{
                  width: i < strength.score ? "100%" : "0%",
                  backgroundColor: strength.color,
                }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full"
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium">
          <span className="text-neutral-400">{pw.length === 0 ? "" : strength.label}</span>
          {confirm.length > 0 && (
            <span className={match ? "text-[#10b981]" : "text-red-400"}>
              {match ? "Matches" : "Doesn't match"}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4">
        <PrimaryButton disabled={!canSubmit || disabled} onClick={onSubmit} label="Create account" />
      </div>
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
    { label: "Too short", color: "#f87171" }, // red-400
    { label: "Weak", color: "#fb923c" }, // orange-400
    { label: "Fair", color: "#fbbf24" }, // amber-400
    { label: "Strong", color: "#34d399" }, // emerald-400
    { label: "Excellent", color: "#10b981" }, // emerald-500
  ];
  return { score: s, ...map[s] };
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90">
      <path
        fill="#ffffff"
        d="M22.5 12.3c0-.8-.1-1.4-.2-2.1H12v3.9h5.9c-.1.9-.8 2.4-2.3 3.4l-.1.1 3.3 2.5.2.1c2.1-1.9 3.3-4.8 3.3-7.9"
      />
      <path
        fill="#ffffff"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-.9.6-2.2 1.1-3.8 1.1-2.9 0-5.4-1.9-6.3-4.6l-.1 0-3.4 2.6-.1.1C3.9 20.4 7.6 23 12 23"
      />
      <path
        fill="#ffffff"
        d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.5.3-2.1V7.2l-3.5-.1C1.4 8.7 1 10.3 1 12s.4 3.3 1.1 4.9L5.7 14"
      />
      <path
        fill="#ffffff"
        d="M12 5.4c2.1 0 3.5.9 4.3 1.7l3.1-3C17.5 2.4 15 1 12 1 7.6 1 3.9 3.6 2.1 7.1L5.7 10c.9-2.7 3.4-4.6 6.3-4.6"
      />
    </svg>
  );
}
