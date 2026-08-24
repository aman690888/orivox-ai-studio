import { createFileRoute, useNavigate, useBlocker } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Palette, Bell, Sparkles, CreditCard, Lock, Loader2, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { updateProfile } from "@/lib/database/profiles";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Orivox" }] }),
  component: Settings,
});

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
  input: "4px 18px 4px 16px / 18px 4px 16px 4px",
};

const tabs = [
  { id: "account", label: "Account", icon: User, emoji: "👤" },
  { id: "appearance", label: "Appearance", icon: Palette, emoji: "🎨" },
  { id: "notifications", label: "Notifications", icon: Bell, emoji: "🔔" },
  { id: "ai", label: "AI Prefs", icon: Sparkles, emoji: "✨" },
  { id: "billing", label: "Billing", icon: CreditCard, emoji: "💳" },
] as const;

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative bg-white border-[3px] border-[#2d2d2d] shadow-[5px_5px_0px_0px_#2d2d2d] ${className}`}
      style={{ borderRadius: R.card }}
    >
      <div
        className="absolute -top-4 left-8 w-12 h-5 bg-gray-300/60 border border-dashed border-gray-400/50"
        style={{ borderRadius: "2px", transform: "rotate(-1.5deg)" }}
      />
      {children}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function Row({
  label,
  hint,
  children,
  border = true,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 p-4 sm:p-6 ${border ? "border-b-[2px] border-dashed border-[#2d2d2d]/30" : ""}`}
    >
      <div className="flex-1 pr-0 sm:pr-6">
        <div className="text-sm font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
          {label}
        </div>
        {hint && (
          <div
            className="mt-1 text-xs text-[#6b6460] leading-relaxed"
            style={{ fontFamily: "Patrick Hand, cursive" }}
          >
            {hint}
          </div>
        )}
      </div>
      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">{children}</div>
    </div>
  );
}

// ─── Hand Input ───────────────────────────────────────────────────────────────
function Field({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`w-full sm:w-72 border-[2px] border-[#2d2d2d] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none transition-all ${
          readOnly
            ? "bg-[#e5e0d8] text-[#6b6460] cursor-not-allowed"
            : "bg-white text-[#2d2d2d] focus:border-[#2d5da1] focus:ring-2 focus:ring-[#2d5da1]/20"
        }`}
        style={{ borderRadius: R.input, fontFamily: "Patrick Hand, cursive" }}
      />
    </div>
  );
}

// ─── Settings Root ────────────────────────────────────────────────────────────
function Settings() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("account");
  const activeTab = tabs.find((t) => t.id === tab);

  return (
    <div className="h-full w-full overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <header>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 self-start px-3 py-1 text-xs bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] mb-2 sm:mb-3"
            style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
          >
            ⚙️ Configuration
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl font-bold text-[#2d2d2d]"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            Settings
          </motion.h1>
          <div className="mt-4 sm:mt-6 border-t-[2px] border-dashed border-[#2d2d2d]" />
        </header>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Sidebar Tabs */}
          <aside className="w-full lg:w-[200px] shrink-0">
            <nav className="flex flex-row overflow-x-auto gap-2 pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold border-[2.5px] border-[#2d2d2d] transition-all duration-100 shrink-0 whitespace-nowrap ${
                    tab === t.id
                      ? "bg-[#2d2d2d] text-white shadow-[2px_2px_0px_0px_#ff4d4d] sm:shadow-[3px_3px_0px_0px_#ff4d4d]"
                      : "bg-white text-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] sm:shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:translate-x-[1px] hover:translate-y-[1px]"
                  }`}
                  style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                >
                  <span className="text-sm sm:text-base">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeTab?.emoji}</span>
                  <h2
                    className="text-2xl font-bold text-[#2d2d2d]"
                    style={{ fontFamily: "Kalam, cursive" }}
                  >
                    {activeTab?.label}
                  </h2>
                </div>

                {tab === "account" && <Account />}
                {tab === "appearance" && <Appearance />}
                {tab === "notifications" && <Notifications />}
                {tab === "ai" && <AIPrefs />}
                {tab === "billing" && <Billing />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────
function Account() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const originalName = user?.user_metadata?.full_name ?? "";
  const email = user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url ?? "";

  const [name, setName] = useState(originalName);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = name !== originalName;
  const isGoogle = user?.app_metadata?.providers?.includes("google");
  const provider = isGoogle
    ? "Google"
    : user?.app_metadata?.providers?.includes("github")
      ? "GitHub"
      : "Email";

  useBlocker({
    shouldBlockFn: () => {
      if (isDirty) return !window.confirm("You have unsaved changes. Are you sure?");
      return false;
    },
  });

  const getInitials = (n: string) =>
    !n
      ? "U"
      : n
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

  const handleSave = async () => {
    if (!isDirty || !user?.id) return;
    setIsSaving(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (authError) throw authError;
      try {
        await updateProfile(user.id, { full_name: name });
      } catch (e) {
        /* silently handled */
      }
      await supabase.auth.refreshSession();
      toast.success("Profile updated! ✓");
    } catch (err) {
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/auth", search: { reset: false } });
    } catch {
      /**/
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <Row
          label="Profile Picture"
          hint={isGoogle ? "Managed by Google." : "Synced with your provider."}
        >
          <Avatar className="h-16 w-16 border-[3px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d]">
            <AvatarImage src={avatarUrl} alt={name || "User"} />
            <AvatarFallback
              className="text-lg font-bold text-white"
              style={{ background: "#ff4d4d", fontFamily: "Kalam, cursive" }}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Row>
        <Row label="Display Name" hint="Used across your workspace.">
          <Field value={name} onChange={setName} />
        </Row>
        <Row label="Email Address" hint="Cannot be changed here." border={false}>
          <div className="relative">
            <Field value={email} readOnly />
            <Lock className="absolute right-3.5 top-3 h-3.5 w-3.5 text-[#6b6460]" />
          </div>
        </Row>
      </SectionCard>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-[#e5e0d8] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
          style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
        >
          Connected via: <strong className="text-[#2d2d2d]">{provider}</strong>
        </div>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d5da1] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} strokeWidth={2.5} />
            )}
            Save Changes
          </button>
        )}
      </div>

      <div className="pt-4 border-t-[2px] border-dashed border-[#2d2d2d]">
        <SectionCard>
          <Row label="Sign out" hint="Log out of your current session.">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-bold border-[2px] border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              Sign out
            </button>
          </Row>
          <Row label="Delete account" hint="Permanent. Everything will be erased." border={false}>
            <button
              className="px-4 py-2 text-sm font-bold border-[2px] border-[#ff4d4d] bg-white text-[#ff4d4d] shadow-[3px_3px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:text-white hover:shadow-[1px_1px_0px_0px_#ff4d4d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              Delete Account
            </button>
          </Row>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function Appearance() {
  const [selected, setSelected] = useState<"light" | "dark" | "system">("light");

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <Row
          label="Interface Theme"
          hint="The hand-drawn aesthetic always stays — this controls light/dark preference."
        >
          <div
            className="flex border-[2px] border-[#2d2d2d] overflow-hidden"
            style={{ borderRadius: R.tag }}
          >
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelected(t)}
                className={`px-4 py-2 text-sm font-bold capitalize transition-all duration-100 border-r-[2px] border-dashed border-[#2d2d2d] last:border-0 ${
                  selected === t
                    ? "bg-[#2d2d2d] text-white"
                    : "bg-white text-[#2d2d2d] hover:bg-[#e5e0d8]"
                }`}
                style={{ fontFamily: "Kalam, cursive" }}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Accent Color" hint="Used in buttons, shadows, and highlights." border={false}>
          <div className="flex gap-3">
            {[
              { color: "#ff4d4d", label: "Red (default)" },
              { color: "#2d5da1", label: "Blue" },
              { color: "#2d8a5b", label: "Green" },
            ].map(({ color, label }) => (
              <button
                key={color}
                title={label}
                className="w-8 h-8 border-[2.5px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] hover:scale-110 transition-transform duration-100"
                style={{ background: color, borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
              />
            ))}
          </div>
        </Row>
      </SectionCard>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function Notifications() {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <Row label="Generation Complete 🎉" hint="Notify me when AI finishes creating a deck.">
          <Switch defaultChecked />
        </Row>
        <Row label="Weekly Summary 📊" hint="A digest of your activity and usage.">
          <Switch />
        </Row>
        <Row
          label="Product Updates 🚀"
          hint="Hear about new features and improvements."
          border={false}
        >
          <Switch defaultChecked />
        </Row>
      </SectionCard>
    </div>
  );
}

// ─── AI Prefs Tab ─────────────────────────────────────────────────────────────
function AIPrefs() {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <Row label="Default Tone" hint="Primary voice used in generated text.">
          <select
            className="w-full sm:w-48 border-[2px] border-[#2d2d2d] px-3 py-2.5 text-sm outline-none bg-white text-[#2d2d2d] focus:border-[#2d5da1] focus:ring-2 focus:ring-[#2d5da1]/20 transition-all"
            style={{ borderRadius: R.input, fontFamily: "Patrick Hand, cursive" }}
          >
            <option>Executive</option>
            <option>Conversational</option>
            <option>Academic</option>
          </select>
        </Row>
        <Row label="Default Length" hint="Preferred presentation length.">
          <select
            className="w-full sm:w-48 border-[2px] border-[#2d2d2d] px-3 py-2.5 text-sm outline-none bg-white text-[#2d2d2d] focus:border-[#2d5da1] focus:ring-2 focus:ring-[#2d5da1]/20 transition-all"
            style={{ borderRadius: R.input, fontFamily: "Patrick Hand, cursive" }}
          >
            <option>10 slides</option>
            <option>15 slides</option>
            <option>20+ slides</option>
          </select>
        </Row>
        <Row
          label="Auto-include Citations"
          hint="Append sources when factual claims are made."
          border={false}
        >
          <Switch defaultChecked />
        </Row>
      </SectionCard>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────
function Billing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      features: ["3 decks / month", "PDF export"],
      active: true,
      rotation: -1.5,
    },
    {
      name: "Pro",
      price: "$20",
      features: ["Unlimited decks", "PPTX + share links", "Priority AI"],
      rotation: 0.8,
    },
    {
      name: "Team",
      price: "$40",
      features: ["Everything in Pro", "Shared library", "SSO"],
      rotation: -0.5,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((p) => (
        <div
          key={p.name}
          className={`relative bg-white border-[3px] border-[#2d2d2d] p-6 transition-all hover:rotate-0 ${
            p.active ? "shadow-[6px_6px_0px_0px_#ff4d4d]" : "shadow-[4px_4px_0px_0px_#2d2d2d]"
          }`}
          style={{ borderRadius: R.card, transform: `rotate(${p.rotation}deg)` }}
        >
          {/* Tape */}
          <div
            className="absolute -top-3 left-1/2 w-10 h-4 bg-gray-300/60 border border-dashed border-gray-400/50"
            style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1deg)" }}
          />

          {p.active && (
            <div
              className="absolute top-0 right-4 -translate-y-1/2 px-3 py-0.5 text-[10px] font-bold text-white bg-[#ff4d4d] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              Current ✓
            </div>
          )}

          <div
            className="text-xs font-bold uppercase tracking-widest text-[#6b6460]"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            {p.name}
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className="text-4xl font-bold text-[#2d2d2d]"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              {p.price}
            </span>
            <span className="text-sm text-[#6b6460]">/mo</span>
          </div>
          <ul className="mt-5 space-y-2.5">
            {p.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-[#4a4440]"
                style={{ fontFamily: "Patrick Hand, cursive" }}
              >
                <div
                  className={`w-4 h-4 flex items-center justify-center border-[2px] border-[#2d2d2d] ${p.active ? "bg-[#ff4d4d]" : "bg-white"}`}
                  style={{ borderRadius: "3px" }}
                >
                  {p.active && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
                {f}
              </li>
            ))}
          </ul>
          <button
            className={`mt-6 w-full py-2.5 text-sm font-bold border-[2.5px] border-[#2d2d2d] transition-all duration-100 ${
              p.active
                ? "bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]"
                : "bg-[#2d2d2d] text-white shadow-[3px_3px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            {p.active ? "Manage Plan" : "Upgrade ✨"}
          </button>
        </div>
      ))}
    </div>
  );
}
