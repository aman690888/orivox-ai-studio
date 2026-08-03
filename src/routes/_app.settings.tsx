import { createFileRoute, useNavigate, useBlocker } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Palette, Bell, Sparkles, CreditCard, Lock, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { updateProfile } from "@/lib/database/profiles";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Orivox" }] }),
  component: Settings,
});

const tabs = [
  { id: "account", label: "Account Details", icon: User, desc: "Manage your personal information and security." },
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Customize the look and feel of your workspace." },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Control your email and push alerts." },
  { id: "ai", label: "AI Preferences", icon: Sparkles, desc: "Tune how Orivox generates content." },
  { id: "billing", label: "Billing & Plans", icon: CreditCard, desc: "Manage your subscription and usage." },
] as const;

function Settings() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("account");
  const activeTabDetails = tabs.find(t => t.id === tab);

  return (
    <div className="h-full w-full overflow-y-auto px-6 py-12 md:px-12 md:py-16 bg-white text-black">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 space-y-2 border-b border-black pb-6">
          <h1 className="text-3xl font-mono font-bold tracking-tight text-black uppercase">Settings</h1>
          <p className="text-sm font-mono text-black">Manage your account settings and preferences.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-[260px] shrink-0">
            <nav className="flex flex-col space-y-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`group relative flex items-center gap-3 border border-black px-4 py-3 text-left transition-all hard-shadow-hover ${
                    tab === t.id ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  <t.icon className={`h-[18px] w-[18px] transition-colors ${tab === t.id ? "text-white" : "text-black group-hover:text-white"}`} />
                  <span className="text-sm font-mono font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-black pb-6">
                  <h2 className="text-xl font-mono font-bold text-black uppercase">{activeTabDetails?.label}</h2>
                  <p className="mt-1.5 text-sm font-mono text-black">{activeTabDetails?.desc}</p>
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

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
      {children}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
  border = true
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 ${border ? "border-b border-black" : ""}`}>
      <div className="flex-1 pr-8">
        <div className="text-sm font-mono font-bold text-black">{label}</div>
        {hint && <div className="mt-1.5 text-xs font-mono text-black leading-relaxed">{hint}</div>}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}

function Field({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      className={`w-full sm:w-72 border border-black px-4 py-2.5 text-sm font-mono outline-none transition-all ${
        readOnly
          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
          : "bg-white text-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      }`}
    />
  );
}

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
      if (isDirty) {
        return !window.confirm("You have unsaved changes. Are you sure you want to leave?");
      }
      return false;
    }
  });

  const getInitials = (n: string) => {
    if (!n) return "U";
    return n.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  };

  const handleSave = async () => {
    if (!isDirty || !user?.id) return;
    setIsSaving(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (authError) throw authError;

      try {
        await updateProfile(user.id, { full_name: name });
      } catch (e) {
        console.warn("Could not update profiles table, but auth user updated.", e);
      }
      
      await supabase.auth.refreshSession();
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/auth" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <SectionCard>
        <Row label="Profile Picture" hint={isGoogle ? "Managed by Google." : "Synced with your provider."}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-white/5 border border-white/10 ring-4 ring-white/[0.02]">
              <AvatarImage src={avatarUrl} alt={name || "User Avatar"} />
              <AvatarFallback className="bg-transparent text-lg font-medium">{getInitials(name)}</AvatarFallback>
            </Avatar>
          </div>
        </Row>
        <Row label="Full Name" hint="Used for communication and team presence.">
          <Field value={name} onChange={setName} />
        </Row>
        <Row label="Email Address" hint="Your email address cannot be changed here." border={false}>
          <div className="relative w-full sm:w-72">
            <Field value={email} readOnly />
            <Lock className="absolute right-3.5 top-3 h-4 w-4 text-muted-foreground/50" />
          </div>
        </Row>
      </SectionCard>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Connected via</span>
          <span className="rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            {provider}
          </span>
        </div>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-all hover:bg-white/90 disabled:opacity-50 active:scale-95 shadow-lg"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </button>
        )}
      </div>

      <div className="pt-8 border-t border-white/5">
        <SectionCard>
          <Row label="Sign out" hint="Log out of your current session on this device.">
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium transition hover:bg-white/[0.05]"
            >
              Sign out
            </button>
          </Row>
          <Row label="Delete account" hint="Permanent action. All data will be erased." border={false}>
            <button className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-500/10 hover:border-rose-500/50">
              Delete Account
            </button>
          </Row>
        </SectionCard>
      </div>
    </div>
  );
}

function Appearance() {
  const { theme, setTheme, accent, setAccent } = useTheme();

  return (
    <div className="space-y-8">
      <SectionCard>
        <Row label="Interface Theme" hint="Select or customize your UI theme.">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-1 shadow-inner">
            {(["dark", "light", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                  theme === t ? "bg-white/[0.08] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Accent Color" hint="Used in highlights, focus rings, and active states." border={false}>
          <div className="flex gap-4">
            <button
              onClick={() => setAccent("blue")}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                accent === "blue" ? "ring-2 ring-white/30 scale-110 shadow-[0_0_15px_oklch(0.68_0.19_255)]" : "ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: "oklch(0.68 0.19 255)" }}
              aria-label="Blue"
            />
            <button
              onClick={() => setAccent("purple")}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                accent === "purple" ? "ring-2 ring-white/30 scale-110 shadow-[0_0_15px_oklch(0.72_0.17_300)]" : "ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: "oklch(0.72 0.17 300)" }}
              aria-label="Purple"
            />
            <button
              onClick={() => setAccent("green")}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                accent === "green" ? "ring-2 ring-white/30 scale-110 shadow-[0_0_15px_oklch(0.69_0.15_160)]" : "ring-1 ring-white/10 opacity-70 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: "oklch(0.69 0.15 160)" }}
              aria-label="Green"
            />
          </div>
        </Row>
      </SectionCard>
    </div>
  );
}

function Notifications() {
  return (
    <div className="space-y-8">
      <SectionCard>
        <Row label="Generation Complete" hint="Get notified when AI finishes long tasks.">
          <Switch defaultChecked />
        </Row>
        <Row label="Weekly Summary" hint="Receive a digest of your activity and usage.">
          <Switch />
        </Row>
        <Row label="Product Updates" hint="Hear about new features and improvements." border={false}>
          <Switch defaultChecked />
        </Row>
      </SectionCard>
    </div>
  );
}

function AIPrefs() {
  return (
    <div className="space-y-8">
      <SectionCard>
        <Row label="Default Tone" hint="The primary voice used in generated text.">
          <select className="w-full sm:w-48 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-foreground cursor-pointer appearance-none">
            <option className="bg-[#0a0a0a]">Executive</option>
            <option className="bg-[#0a0a0a]">Conversational</option>
            <option className="bg-[#0a0a0a]">Academic</option>
          </select>
        </Row>
        <Row label="Default Length" hint="Preferred presentation length.">
          <select className="w-full sm:w-48 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-foreground cursor-pointer appearance-none">
            <option className="bg-[#0a0a0a]">10 slides</option>
            <option className="bg-[#0a0a0a]">15 slides</option>
            <option className="bg-[#0a0a0a]">20+ slides</option>
          </select>
        </Row>
        <Row label="Always Include Citations" hint="Automatically append sources when factual claims are made." border={false}>
          <Switch defaultChecked />
        </Row>
      </SectionCard>
    </div>
  );
}

function Billing() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { name: "Free", price: "$0", features: ["3 decks / month", "PDF export"], active: true },
          {
            name: "Pro",
            price: "$20",
            features: ["Unlimited decks", "PPTX + share links", "Priority AI"],
          },
          { name: "Team", price: "$40", features: ["Everything in Pro", "Shared library", "SSO"] },
        ].map((p) => (
          <div
            key={p.name}
            className={`relative border-2 border-black bg-white p-6 transition-all hard-shadow-hover ${p.active ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}`}
          >
            {p.active && (
              <div className="absolute top-0 right-6 -translate-y-1/2 border border-black bg-white px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Current Plan
              </div>
            )}
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-black">{p.name}</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-mono font-bold text-black">{p.price}</span>
              <span className="text-sm font-mono font-medium text-black">/mo</span>
            </div>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-mono text-black">
                  <div className={`h-1.5 w-1.5 border border-black ${p.active ? "bg-black" : "bg-transparent"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`mt-8 w-full border border-black py-2.5 text-sm font-mono font-bold transition-all hard-shadow-hover ${p.active ? "bg-white text-black hover:bg-black hover:text-white" : "bg-black text-white hover:bg-white hover:text-black"}`}>
               {p.active ? "Manage Plan" : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
