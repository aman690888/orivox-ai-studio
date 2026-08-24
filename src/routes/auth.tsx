import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Orivox" },
      { name: "description", content: "Sign in or create your Orivox account." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { reset?: boolean } => {
    return {
      reset: search.reset === "true" || search.reset === true,
    };
  },
  component: Auth,
});

type Mode = "signup" | "login";
type SignupStep = "email" | "confirm-sent" | "password";
type LoginStep = "credentials" | "forgot" | "forgot-sent";

// ─── Wobbly Radius Values (same as homepage) ─────────────────────────────────
const R = {
  wobblyBtn: "18px 6px 22px 8px / 6px 22px 8px 18px",
  wobblyCard: "6px 38px 6px 42px / 38px 6px 42px 6px",
  wobblyMd: "8px 42px 12px 38px / 42px 12px 38px 8px",
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  input: "4px 18px 4px 16px / 18px 4px 16px 4px",
};

// ─── Hand-Drawn Input ─────────────────────────────────────────────────────────
function HandInput({
  type = "text",
  value,
  onChange,
  placeholder,
  autoFocus = false,
  label,
  rightElement,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          className="text-sm font-bold text-[#2d2d2d]"
          style={{ fontFamily: "Kalam, cursive" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border-[2px] border-[#2d2d2d] bg-[#fdfbf7] px-4 py-3 text-base outline-none transition-all placeholder-[#2d2d2d]/40 focus:border-[#2d5da1] focus:ring-2 focus:ring-[#2d5da1]/20 focus:bg-white"
          style={{ borderRadius: R.input, fontFamily: "Patrick Hand, cursive" }}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryBtn({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-bold bg-[#2d2d2d] text-white border-[3px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:border-[#ff4d4d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#2d2d2d] disabled:hover:shadow-[4px_4px_0px_0px_#ff4d4d] disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-all duration-100 cursor-pointer ${className}`}
      style={{ borderRadius: R.wobblyBtn, fontFamily: "Kalam, cursive" }}
    >
      {children}
    </button>
  );
}

// ─── Secondary Button ─────────────────────────────────────────────────────────
function SecondaryBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-bold bg-[#e5e0d8] text-[#2d2d2d] border-[3px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#2d5da1] hover:text-white hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-100 cursor-pointer ${className}`}
      style={{ borderRadius: R.wobblyBtn, fontFamily: "Kalam, cursive" }}
    >
      {children}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div
      className="my-6 flex items-center gap-4 text-sm text-[#6b6460]"
      style={{ fontFamily: "Kalam, cursive" }}
    >
      <span className="h-[2px] flex-1 border-t-[2px] border-dashed border-[#2d2d2d]/30" />
      <span>or</span>
      <span className="h-[2px] flex-1 border-t-[2px] border-dashed border-[#2d2d2d]/30" />
    </div>
  );
}

// ─── Step Transition Shell ────────────────────────────────────────────────────
function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
      <path d="M22.5 12.3c0-.8-.1-1.4-.2-2.1H12v3.9h5.9c-.1.9-.8 2.4-2.3 3.4l-.1.1 3.3 2.5.2.1c2.1-1.9 3.3-4.8 3.3-7.9" />
      <path d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-.9.6-2.2 1.1-3.8 1.1-2.9 0-5.4-1.9-6.3-4.6l-.1 0-3.4 2.6-.1.1C3.9 20.4 7.6 23 12 23" />
      <path d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.5.3-2.1V7.2l-3.5-.1C1.4 8.7 1 10.3 1 12s.4 3.3 1.1 4.9L5.7 14" />
      <path d="M12 5.4c2.1 0 3.5.9 4.3 1.7l3.1-3C17.5 2.4 15 1 12 1 7.6 1 3.9 3.6 2.1 7.1L5.7 10c.9-2.7 3.4-4.6 6.3-4.6" />
    </svg>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function scorePassword(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too weak 😬", color: "#ef4444" },
    { label: "Getting there 🤔", color: "#f97316" },
    { label: "Looking good! 👍", color: "#eab308" },
    { label: "Strong! 💪", color: "#22c55e" },
    { label: "Excellent! 🔒", color: "#14b8a6" },
  ];
  return { score: s, ...map[s] };
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// ─── Password Fields ──────────────────────────────────────────────────────────
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
  const [showPw, setShowPw] = useState(false);
  const strength = useMemo(() => scorePassword(pw), [pw]);
  const match = pw.length > 0 && pw === confirm;
  const canSubmit = strength.score >= 2 && match;

  return (
    <div className="flex flex-col gap-5">
      <HandInput
        type={showPw ? "text" : "password"}
        value={pw}
        onChange={setPw}
        label="Password"
        autoFocus
        placeholder="Something sneaky..."
        rightElement={
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="text-[#2d2d2d]/60 hover:text-[#2d2d2d]"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      {/* Strength bar */}
      {pw.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 flex-1 border-[2px] border-[#2d2d2d]"
                style={{ borderRadius: "2px", overflow: "hidden" }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: i < strength.score ? "100%" : "0%",
                    backgroundColor: strength.color,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                />
              </div>
            ))}
          </div>
          <span className="text-xs text-[#4a4440]" style={{ fontFamily: "Patrick Hand, cursive" }}>
            {strength.label}
          </span>
        </div>
      )}

      <HandInput
        type="password"
        value={confirm}
        onChange={setConfirm}
        label="Confirm password"
        placeholder="Same thing again..."
      />
      {confirm.length > 0 && (
        <span
          className={`text-xs -mt-3 ${match ? "text-[#22c55e]" : "text-[#ff4d4d]"}`}
          style={{ fontFamily: "Patrick Hand, cursive" }}
        >
          {match ? "✓ Passwords match!" : "✗ Passwords don't match yet"}
        </span>
      )}

      <PrimaryBtn disabled={!canSubmit || disabled} onClick={onSubmit}>
        Create Account 🎉
      </PrimaryBtn>
    </div>
  );
}

// ─── Main Auth Component ──────────────────────────────────────────────────────
function Auth() {
  const { user, loading, refreshSession } = useAuth();
  const search = Route.useSearch();
  const isResetting = search.reset;

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
    // We only navigate away if the user is fully logged in AND they are NOT actively trying to reset their password
    if (!loading && user && !isResetting) {
      navigate({ to: "/home" });
    }
  }, [user, loading, navigate, isResetting]);

  const handleUpdatePassword = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate({ to: "/home" });
    } catch (err: any) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

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
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || "Failed Google Authentication";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const handleEmailStep = () => {
    setAuthError(null);
    const sanitizedEmail = email.trim().toLowerCase();
    setEmail(sanitizedEmail);
    if (!isValidEmail(sanitizedEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setSignupStep("password");
  };

  const parseAuthError = (err: any): string => {
    if (err?.status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (err?.message?.includes("already registered"))
      return "An account with this email already exists.";
    if (err?.message?.includes("Invalid login credentials")) return "Incorrect email or password.";
    if (err?.message?.includes("Password should be at least")) return "Password is too weak.";
    return err?.message || "An unexpected error occurred.";
  };

  const handleSignUp = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/home` },
      });
      if (error) throw error;
      setSignupStep("confirm-sent");
      toast.success("Account created! Check your email.");
    } catch (err: any) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate({ to: "/home" });
    } catch (err: any) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      setLoginStep("forgot-sent");
      toast.success("Password reset link sent!");
    } catch (err: any) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "#fdfbf7",
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className="flex flex-col items-center gap-4 p-8 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d]"
          style={{ borderRadius: "8px 42px 12px 38px / 42px 12px 38px 8px" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4d4d]" />
          <p style={{ fontFamily: "Kalam, cursive", color: "#2d2d2d" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#fdfbf7",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily: "Patrick Hand, cursive",
        color: "#2d2d2d",
      }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7]/95 backdrop-blur-md border-b-[3px] border-[#2d2d2d] border-dashed">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1 bg-[#fff9c4] border-[2px] border-[#2d2d2d] text-xs sm:text-sm shadow-[2px_2px_0px_0px_#2d2d2d]"
            style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
          >
            ✍️ <span>Secure Sign In</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* ── Left: Branding Panel ── */}
          <div className="hidden md:flex flex-col gap-8 relative">
            {/* Decorative tilted card behind */}
            <div
              className="absolute inset-0 bg-[#fff9c4] border-[3px] border-[#2d2d2d] -z-10"
              style={{ borderRadius: R.wobblyCard, transform: "rotate(3deg) translate(8px, 8px)" }}
            />

            <div
              className="relative bg-white border-[3px] border-[#2d2d2d] p-10 shadow-[8px_8px_0px_0px_#2d2d2d] flex flex-col gap-6"
              style={{ borderRadius: R.wobblyCard }}
            >
              {/* Tape decoration */}
              <div
                className="absolute -top-4 left-1/2 w-14 h-5 bg-gray-300/60 border border-dashed border-gray-400/50"
                style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1deg)" }}
              />

              <h1
                className="text-5xl font-bold text-[#2d2d2d] leading-tight"
                style={{ fontFamily: "Kalam, cursive" }}
              >
                Welcome back ✌️
              </h1>

              <p
                className="text-lg text-[#4a4440] leading-relaxed"
                style={{ fontFamily: "Patrick Hand, cursive" }}
              >
                Sign in and get back to building{" "}
                <span className="font-bold text-[#ff4d4d]">beautiful decks</span>. Your slides are
                waiting.
              </p>

              {/* Feature bullets */}
              <div className="flex flex-col gap-3 pt-2">
                {[
                  "🚀 Generate a full deck in under 30 seconds",
                  "✏️ Edit anything after generation",
                  "📤 Export to PDF, PPTX or share a link",
                  "🔒 Your data stays private, always",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-base px-4 py-2 bg-[#fdfbf7] border-[2px] border-dashed border-[#2d2d2d]/40"
                    style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-3">
                  {["#ff4d4d", "#2d5da1", "#2d2d2d", "#e5a020"].map((c, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: c,
                        borderRadius: "50% 45% 50% 45% / 45% 50% 45% 50%",
                        zIndex: 4 - i,
                      }}
                    >
                      {["K", "A", "J", "M"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#6b6460]">
                  <strong className="text-[#2d2d2d]">1,000+ creators</strong> already on board
                </p>
              </div>

              {/* Bouncing pencil */}
              <div
                className="absolute -bottom-6 -right-6 w-14 h-14 bg-[#fff9c4] border-[3px] border-[#2d2d2d] flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_#2d2d2d] animate-gentle-bounce"
                style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
              >
                ✏️
              </div>
            </div>

            {/* Back to home link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[#6b6460] hover:text-[#ff4d4d] transition-colors self-start"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              <ArrowLeft size={16} strokeWidth={2.5} /> Back to homepage
            </Link>
          </div>

          {/* ── Right: Auth Form Card ── */}
          <div className="relative w-full max-w-md mx-auto">
            {/* Tilted card behind */}
            <div
              className="absolute inset-0 bg-[#e5e0d8] border-[3px] border-[#2d2d2d] -z-10"
              style={{
                borderRadius: R.wobblyCard,
                transform: "rotate(-2deg) translate(-4px, 4px)",
              }}
            />

            <div
              className="relative bg-white border-[3px] border-[#2d2d2d] p-5 sm:p-8 shadow-[6px_6px_0px_0px_#ff4d4d] min-h-[480px] sm:min-h-[520px] flex flex-col"
              style={{ borderRadius: R.wobblyCard }}
            >
              {/* Tape */}
              <div
                className="absolute -top-4 left-1/2 w-14 h-5 bg-gray-300/60 border border-dashed border-gray-400/50"
                style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(1deg)" }}
              />

              {/* Mode tabs (shown on email/credentials steps only) */}
              {!isResetting &&
                ((mode === "signup" && signupStep === "email") ||
                  (mode === "login" && loginStep === "credentials")) && (
                  <div className="flex gap-2 mb-8">
                    {(["login", "signup"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => resetAll(t)}
                        className={`flex-1 py-2.5 text-base font-bold border-[2.5px] border-[#2d2d2d] transition-all duration-100 ${
                          mode === t
                            ? "bg-[#2d2d2d] text-white shadow-[3px_3px_0px_0px_#ff4d4d]"
                            : "bg-[#fdfbf7] text-[#2d2d2d] hover:bg-[#e5e0d8]"
                        }`}
                        style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                      >
                        {t === "login" ? "✌️ Sign In" : "🚀 Join Free"}
                      </button>
                    ))}
                  </div>
                )}

              {/* Error message */}
              {authError && (
                <div
                  className="mb-6 px-4 py-3 bg-[#fff9c4] border-[2px] border-[#ff4d4d] text-[#ff4d4d] text-sm shadow-[2px_2px_0px_0px_#ff4d4d]"
                  style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
                >
                  ⚠️ {authError}
                </div>
              )}

              {/* Form Steps */}
              <div className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                  {/* Reset Password Flow */}
                  {isResetting && (
                    <StepShell key="reset-password">
                      <div className="mb-6">
                        <h2
                          className="text-3xl font-bold text-[#2d2d2d]"
                          style={{ fontFamily: "Kalam, cursive" }}
                        >
                          New Password 🗝️
                        </h2>
                        <p
                          className="text-[#6b6460] mt-1"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          You're almost back in! Enter your new password below.
                        </p>
                      </div>
                      <PasswordFields
                        pw={password}
                        setPw={setPassword}
                        confirm={confirmPassword}
                        setConfirm={setConfirmPassword}
                        onSubmit={handleUpdatePassword}
                        disabled={actionLoading}
                      />
                    </StepShell>
                  )}

                  {/* Signup — email step */}
                  {!isResetting && mode === "signup" && signupStep === "email" && (
                    <StepShell key="signup-email">
                      <div className="mb-6">
                        <h2
                          className="text-3xl font-bold text-[#2d2d2d]"
                          style={{ fontFamily: "Kalam, cursive" }}
                        >
                          Create your account 🎉
                        </h2>
                        <p
                          className="text-[#6b6460] mt-1"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          It's free. No credit card needed.
                        </p>
                      </div>
                      <div className="flex flex-col gap-5">
                        <HandInput
                          type="email"
                          value={email}
                          onChange={setEmail}
                          label="Your email"
                          autoFocus
                          placeholder="you@example.com"
                        />
                        <PrimaryBtn
                          disabled={!isValidEmail(email) || actionLoading}
                          onClick={handleEmailStep}
                        >
                          Continue with Email →
                        </PrimaryBtn>
                        <Divider />
                        <SecondaryBtn onClick={handleOAuth}>
                          <GoogleIcon /> Sign up with Google
                        </SecondaryBtn>
                      </div>
                    </StepShell>
                  )}

                  {/* Signup — password step */}
                  {!isResetting && mode === "signup" && signupStep === "password" && (
                    <StepShell key="signup-password">
                      <div className="mb-6">
                        <h2
                          className="text-3xl font-bold text-[#2d2d2d]"
                          style={{ fontFamily: "Kalam, cursive" }}
                        >
                          Set your password 🔒
                        </h2>
                        <p
                          className="text-[#6b6460] mt-1"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          Make it good — you'll be back often.
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
                        className="mt-5 inline-flex items-center gap-1 text-sm text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                        style={{ fontFamily: "Patrick Hand, cursive" }}
                      >
                        <ArrowLeft size={14} /> Go back
                      </button>
                    </StepShell>
                  )}

                  {/* Signup — confirm sent */}
                  {!isResetting && mode === "signup" && signupStep === "confirm-sent" && (
                    <StepShell key="confirm-sent">
                      <div className="flex flex-col items-center text-center py-8 gap-5">
                        <div
                          className="w-20 h-20 bg-[#fff9c4] border-[3px] border-[#2d2d2d] flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_#2d2d2d] animate-gentle-bounce"
                          style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                        >
                          📬
                        </div>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: "Kalam, cursive" }}>
                          Check your inbox!
                        </h2>
                        <p
                          className="text-[#4a4440]"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          We sent a confirmation link to{" "}
                          <strong className="text-[#2d2d2d]">{email}</strong>. Click it and you're
                          in! 🎉
                        </p>
                        <button
                          onClick={() => resetAll("login")}
                          className="mt-4 inline-flex items-center gap-2 text-sm text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          <ArrowLeft size={14} /> Back to Sign In
                        </button>
                      </div>
                    </StepShell>
                  )}

                  {/* Login — credentials step */}
                  {!isResetting && mode === "login" && loginStep === "credentials" && (
                    <StepShell key="login">
                      <div className="mb-6">
                        <h2
                          className="text-3xl font-bold text-[#2d2d2d]"
                          style={{ fontFamily: "Kalam, cursive" }}
                        >
                          Welcome back! ✌️
                        </h2>
                        <p
                          className="text-[#6b6460] mt-1"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          Let's get you back to your slides.
                        </p>
                      </div>
                      <div className="flex flex-col gap-5">
                        <HandInput
                          type="email"
                          value={email}
                          onChange={setEmail}
                          label="Email"
                          autoFocus
                          placeholder="you@example.com"
                        />
                        <HandInput
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={setPassword}
                          label="Password"
                          placeholder="Your secret..."
                          rightElement={
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="text-[#2d2d2d]/60 hover:text-[#2d2d2d]"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          }
                        />
                        <div className="flex justify-end -mt-2">
                          <button
                            onClick={() => setLoginStep("forgot")}
                            className="text-sm text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                            style={{ fontFamily: "Patrick Hand, cursive" }}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <PrimaryBtn
                          disabled={!isValidEmail(email) || !password || actionLoading}
                          onClick={handleLogin}
                        >
                          Sign In →
                        </PrimaryBtn>
                        <Divider />
                        <SecondaryBtn onClick={handleOAuth}>
                          <GoogleIcon /> Continue with Google
                        </SecondaryBtn>
                      </div>
                    </StepShell>
                  )}

                  {/* Login — forgot password */}
                  {!isResetting && mode === "login" && loginStep === "forgot" && (
                    <StepShell key="forgot">
                      <div className="mb-6">
                        <h2
                          className="text-3xl font-bold text-[#2d2d2d]"
                          style={{ fontFamily: "Kalam, cursive" }}
                        >
                          Forgot password? 🤔
                        </h2>
                        <p
                          className="text-[#6b6460] mt-1"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          No worries! We'll send you a reset link.
                        </p>
                      </div>
                      <div className="flex flex-col gap-5">
                        <HandInput
                          type="email"
                          value={email}
                          onChange={setEmail}
                          label="Your email"
                          autoFocus
                          placeholder="you@example.com"
                        />
                        <PrimaryBtn
                          disabled={!isValidEmail(email) || actionLoading}
                          onClick={handleResetPassword}
                        >
                          Send Reset Link 📧
                        </PrimaryBtn>
                        <button
                          onClick={() => setLoginStep("credentials")}
                          className="inline-flex items-center gap-1 text-sm text-[#6b6460] hover:text-[#ff4d4d] transition-colors self-start"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          <ArrowLeft size={14} /> Go back
                        </button>
                      </div>
                    </StepShell>
                  )}

                  {/* Login — forgot sent */}
                  {!isResetting && mode === "login" && loginStep === "forgot-sent" && (
                    <StepShell key="forgot-sent">
                      <div className="flex flex-col items-center text-center py-8 gap-5">
                        <div
                          className="w-20 h-20 bg-[#fff9c4] border-[3px] border-[#2d2d2d] flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_#2d2d2d] animate-gentle-bounce"
                          style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                        >
                          📧
                        </div>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: "Kalam, cursive" }}>
                          Check your inbox!
                        </h2>
                        <p
                          className="text-[#4a4440]"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          If <strong className="text-[#2d2d2d]">{email}</strong> has an account,
                          you'll get a reset link shortly.
                        </p>
                        <button
                          onClick={() => setLoginStep("credentials")}
                          className="mt-4 inline-flex items-center gap-2 text-sm text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                          style={{ fontFamily: "Patrick Hand, cursive" }}
                        >
                          <ArrowLeft size={14} /> Back to Sign In
                        </button>
                      </div>
                    </StepShell>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer note */}
              <p
                className="text-xs text-[#6b6460] text-center mt-6 pt-4 border-t-[2px] border-dashed border-[#2d2d2d]/20"
                style={{ fontFamily: "Patrick Hand, cursive" }}
              >
                By continuing you agree to our{" "}
                <span className="underline cursor-pointer hover:text-[#ff4d4d]">Terms</span>
                {" & "}
                <span className="underline cursor-pointer hover:text-[#ff4d4d]">
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-[3px] border-dashed border-[#2d2d2d] py-6 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="opacity-70 grayscale">
            <Logo />
          </div>
          <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
            © 2026 Orivox Inc. — made with ✏️
          </p>
        </div>
      </footer>
    </div>
  );
}
