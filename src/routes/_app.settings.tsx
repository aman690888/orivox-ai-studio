import { createFileRoute, useNavigate, useBlocker } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
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
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI Preferences", icon: Sparkles },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

function Settings() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("account");

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-6 py-10 md:py-14">
      <aside className="w-52 shrink-0">
        <h1 className="mb-5 text-lg font-semibold tracking-tight">Settings</h1>
        <nav className="flex flex-col gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="settings-tab"
                  className="absolute inset-0 rounded-lg bg-white/[0.06]"
                />
              )}
              <t.icon className="relative h-4 w-4" />
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          {tab === "account" && <Account />}
          {tab === "appearance" && <Appearance />}
          {tab === "notifications" && <Notifications />}
          {tab === "ai" && <AIPrefs />}
          {tab === "billing" && <Billing />}
        </motion.div>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border pt-4 first:border-0 first:pt-0">
      <div>
        <div className="text-sm">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
      {children}
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
      className={`w-64 rounded-lg border border-border px-3 py-2 text-sm outline-none ${
        readOnly
          ? "cursor-default bg-white/[0.01] text-muted-foreground"
          : "bg-white/[0.03] focus:border-white/25"
      }`}
    />
  );
}

function Account() {
  const { signOut, session, user } = useAuth();
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

  // Block navigation if there are unsaved changes
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
      
      // refresh local session hack:
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
    <Section title="Account" desc="Manage your identity on Orivox.">
      <Row label="Avatar">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-muted">
            <AvatarImage src={avatarUrl} alt={name || "User Avatar"} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start gap-1">
            {isGoogle && (
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Managed by Google
              </span>
            )}
            {!isGoogle && (
              <span className="text-xs text-muted-foreground">
                Avatar is synced with your provider.
              </span>
            )}
          </div>
        </div>
      </Row>

      <Row label="Name">
        <Field value={name} onChange={setName} />
      </Row>

      <Row label="Email" hint="Your email address cannot be changed here.">
        <div className="relative w-64">
          <Field value={email} readOnly />
          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
        </div>
      </Row>

      <Row label="Provider">
        <span className="rounded bg-white/10 px-2.5 py-1 text-xs text-foreground">
          {provider}
        </span>
      </Row>

      {isDirty && (
        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      )}

      <Row label="Sign out" hint="Log out of your current session">
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-white/5"
        >
          Sign out
        </button>
      </Row>
      <Row label="Delete account" hint="Permanent and cannot be undone">
        <button className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/10">
          Delete
        </button>
      </Row>
    </Section>
  );
}

function Appearance() {
  const { theme, setTheme, accent, setAccent } = useTheme();

  return (
    <Section title="Appearance" desc="Personalize how Orivox looks.">
      <Row label="Theme" hint="Dark mode is optimized for long sessions.">
        <div className="flex rounded-lg border border-border p-0.5 text-xs">
          {(["dark", "light", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-md px-3 py-1.5 capitalize transition-colors ${
                theme === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Accent" hint="Used in prompts, focus rings, and highlights.">
        <div className="flex gap-2">
          <button
            onClick={() => setAccent("blue")}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
              accent === "blue" ? "glow-electric ring-2 ring-white/20" : "ring-1 ring-white/10 opacity-70 hover:opacity-100"
            }`}
            style={{ backgroundColor: "oklch(0.68 0.19 255)" }}
            aria-label="Blue"
          />
          <button
            onClick={() => setAccent("purple")}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
              accent === "purple" ? "glow-electric ring-2 ring-white/20" : "ring-1 ring-white/10 opacity-70 hover:opacity-100"
            }`}
            style={{ backgroundColor: "oklch(0.72 0.17 300)" }}
            aria-label="Purple"
          />
          <button
            onClick={() => setAccent("green")}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
              accent === "green" ? "glow-electric ring-2 ring-white/20" : "ring-1 ring-white/10 opacity-70 hover:opacity-100"
            }`}
            style={{ backgroundColor: "oklch(0.69 0.15 160)" }}
            aria-label="Green"
          />
        </div>
      </Row>
    </Section>
  );
}

function Notifications() {
  return (
    <Section title="Notifications">
      <Row label="Generation complete">
        <Switch defaultChecked />
      </Row>
      <Row label="Weekly summary">
        <Switch />
      </Row>
      <Row label="Product updates">
        <Switch defaultChecked />
      </Row>
    </Section>
  );
}

function AIPrefs() {
  return (
    <Section title="AI Preferences" desc="Tune how Orivox writes and designs.">
      <Row label="Default tone">
        <select className="rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm">
          <option>Executive</option>
          <option>Conversational</option>
          <option>Academic</option>
        </select>
      </Row>
      <Row label="Default length">
        <select className="rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm">
          <option>10 slides</option>
          <option>15 slides</option>
          <option>20+ slides</option>
        </select>
      </Row>
      <Row label="Always include citations">
        <Switch defaultChecked />
      </Row>
    </Section>
  );
}

function Billing() {
  return (
    <Section title="Billing" desc="Free plan · usage-based limits apply.">
      <div className="grid gap-3 md:grid-cols-3">
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
            className={`rounded-xl border p-4 ${p.active ? "border-electric/50 bg-electric/5" : "border-border"}`}
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.name}</div>
            <div className="mt-2 text-2xl font-semibold">
              {p.price}
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {p.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
