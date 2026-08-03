import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Marquee from "react-fast-marquee";

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
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7] text-black">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#F9F9F7] text-black selection:bg-black selection:text-white border-x border-black max-w-[1440px] mx-auto">
      <header className="border-b border-black p-4 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        <div className="font-mono text-xs uppercase tracking-widest font-bold">Authentication</div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black">
        
        {/* Left Side - Typography/Ticker */}
        <div className="flex flex-col border-b md:border-b-0 border-black bg-black justify-between relative overflow-hidden group">
            <img 
                src="/auth-bg.jpg" 
                alt="Auth Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale mix-blend-luminosity transition-all duration-1000 group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:opacity-100" 
            />
            {/* Dark overlay to help contrast */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-1000 z-0"></div>
            
            <div className="p-8 md:p-12 z-10 pointer-events-none relative flex flex-col items-start mt-8">
                <div className="bg-[#F9F9F7] text-black p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="font-serif text-5xl md:text-7xl leading-[0.9] tracking-tighter uppercase mb-4">
                        Enter the System
                    </h1>
                    <p className="font-mono text-sm md:text-base uppercase tracking-widest bg-black text-[#F9F9F7] inline-block px-3 py-1">
                        Secure Access Required.
                    </p>
                </div>
            </div>
            
            <div className="py-4 border-t-2 border-black bg-[#F9F9F7] text-black font-mono text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden z-10">
                <Marquee speed={40} gradient={false}>
                    <span className="mx-4 font-bold">UNAUTHORIZED ACCESS PROHIBITED</span> •
                    <span className="mx-4 font-bold">SECURE YOUR ACCOUNT</span> •
                    <span className="mx-4 font-bold">ENCRYPTED CONNECTION ESTABLISHED</span> •
                </Marquee>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8 md:p-16 bg-[#F9F9F7]">
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="w-full max-w-[400px] border border-black bg-[#F9F9F7] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
                {authError && (
                    <div className="mb-6 border-l-4 border-black bg-neutral-200 p-4 text-sm font-medium">
                        {authError}
                    </div>
                )}

                {((mode === "signup" && signupStep === "email") ||
                    (mode === "login" && loginStep === "credentials")) && (
                    <div className="mb-8 flex border-b border-black">
                        {(["login", "signup"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => resetAll(t)}
                            className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                            mode === t ? "text-black border-b-2 border-black -mb-[1px]" : "text-neutral-500 hover:text-black"
                            }`}
                        >
                            {t === "login" ? "Sign In" : "Subscribe"}
                        </button>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {mode === "signup" && signupStep === "email" && (
                    <StepShell key="signup-email">
                        <div className="mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase">Subscribe</h2>
                            <p className="mt-2 text-sm font-mono uppercase text-neutral-600">
                                Enter credentials below.
                            </p>
                        </div>
                        <EmailInput email={email} setEmail={setEmail} />
                        <div className="mt-6">
                            <PrimaryButton
                                disabled={!isValidEmail(email) || actionLoading}
                                onClick={handleEmailStep}
                                label="Continue with Email"
                            />
                        </div>
                        <Divider />
                        <GoogleButton onClick={handleOAuth} label="Authenticate via Google" />
                    </StepShell>
                    )}

                    {mode === "signup" && signupStep === "password" && (
                    <StepShell key="signup-password">
                        <div className="mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase">Set Password</h2>
                            <p className="mt-2 text-sm font-mono uppercase text-neutral-600">
                                Secure your access.
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
                            className="mt-6 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
                        >
                            ← Return
                        </button>
                    </StepShell>
                    )}

                    {mode === "signup" && signupStep === "confirm-sent" && (
                    <StepShell key="confirm-sent">
                        <div className="flex flex-col items-center py-6 text-center border border-black p-8">
                            <div className="flex h-16 w-16 items-center justify-center border-2 border-black rounded-full mb-6">
                                <Check className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-serif uppercase font-bold mb-2">Check Email</h2>
                            <p className="text-sm font-mono text-neutral-600">
                                Link dispatched to <br />
                                <span className="font-bold text-black">{email}</span>
                            </p>
                            <button
                                onClick={() => resetAll("login")}
                                className="mt-8 border border-black px-6 py-2 text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
                            >
                                Return to Sign In
                            </button>
                        </div>
                    </StepShell>
                    )}

                    {mode === "login" && loginStep === "credentials" && (
                    <StepShell key="login">
                        <div className="mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase">Authenticate</h2>
                            <p className="mt-2 text-sm font-mono uppercase text-neutral-600">Provide credentials.</p>
                        </div>

                        <div className="space-y-6">
                            <EmailInput email={email} setEmail={setEmail} />
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-sm font-bold uppercase tracking-widest">Password</label>
                                    <button
                                        onClick={() => setLoginStep("forgot")}
                                        className="text-xs font-bold uppercase text-neutral-500 hover:text-black"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border-2 border-black bg-transparent px-4 py-3 text-sm font-medium outline-none transition focus:bg-neutral-200 rounded-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:opacity-70"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <PrimaryButton
                                disabled={!isValidEmail(email) || !password || actionLoading}
                                onClick={handleLogin}
                                label="Sign In"
                            />
                        </div>

                        <Divider />
                        <GoogleButton onClick={handleOAuth} label="Authenticate via Google" />
                    </StepShell>
                    )}

                    {mode === "login" && loginStep === "forgot" && (
                    <StepShell key="forgot">
                        <div className="mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase">Reset Access</h2>
                            <p className="mt-2 text-sm font-mono uppercase text-neutral-600">
                                Link will be dispatched.
                            </p>
                        </div>
                        <EmailInput email={email} setEmail={setEmail} />
                        <div className="mt-6">
                            <PrimaryButton
                                disabled={!isValidEmail(email) || actionLoading}
                                onClick={handleResetPassword}
                                label="Dispatch Link"
                            />
                        </div>
                        <button
                            onClick={() => setLoginStep("credentials")}
                            className="mt-6 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
                        >
                            ← Return
                        </button>
                    </StepShell>
                    )}

                    {mode === "login" && loginStep === "forgot-sent" && (
                    <StepShell key="forgot-sent">
                        <div className="flex flex-col items-center py-6 text-center border border-black p-8">
                            <div className="flex h-16 w-16 items-center justify-center border-2 border-black rounded-full mb-6">
                                <Check className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-serif uppercase font-bold mb-2">Check Email</h2>
                            <p className="text-sm font-mono text-neutral-600">
                                If active, link dispatched to <br />
                                <span className="font-bold text-black">{email}</span>
                            </p>
                            <button
                                onClick={() => setLoginStep("credentials")}
                                className="mt-8 border border-black px-6 py-2 text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
                            >
                                Return to Sign In
                            </button>
                        </div>
                    </StepShell>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
      </div>
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
    <div className="my-8 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
      <span className="h-[2px] flex-1 bg-black" />
      <span>OR</span>
      <span className="h-[2px] flex-1 bg-black" />
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
      <label className="mb-2 block text-sm font-bold uppercase tracking-widest">Email Address</label>
      <input
        type="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="USER@DOMAIN.COM"
        className="w-full border-2 border-black bg-transparent px-4 py-3 text-sm font-medium outline-none transition focus:bg-neutral-200 rounded-none placeholder-neutral-400"
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
      className="flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-transparent hover:text-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
    >
      {label}
    </button>
  );
}

function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 border-2 border-black bg-transparent px-4 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white rounded-none"
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
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-bold uppercase tracking-widest">Password</label>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full border-2 border-black bg-transparent px-4 py-3 text-sm outline-none transition focus:bg-neutral-200 rounded-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold uppercase tracking-widest">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border-2 border-black bg-transparent px-4 py-3 text-sm outline-none transition focus:bg-neutral-200 rounded-none"
        />
      </div>

      <div className="pt-2">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 flex-1 border border-black bg-transparent">
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
        <div className="mt-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-black">{pw.length === 0 ? "" : strength.label}</span>
          {confirm.length > 0 && (
            <span className={match ? "text-[#10b981]" : "text-red-600"}>
              {match ? "VERIFIED" : "MISMATCH"}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4">
        <PrimaryButton disabled={!canSubmit || disabled} onClick={onSubmit} label="Create Account" />
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
    { label: "WEAK", color: "#ef4444" },
    { label: "FAIR", color: "#f97316" },
    { label: "GOOD", color: "#eab308" },
    { label: "STRONG", color: "#22c55e" },
    { label: "EXCELLENT", color: "#14b8a6" },
  ];
  return { score: s, ...map[s] };
}

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
