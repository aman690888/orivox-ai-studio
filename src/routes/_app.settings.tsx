import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { User, Palette, Bell, Sparkles, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

function Field({ defaultValue }: { defaultValue: string }) {
  return (
    <input
      defaultValue={defaultValue}
      className="w-64 rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-white/25"
    />
  );
}

function Account() {
  return (
    <Section title="Account" desc="Manage your identity on Orivox.">
      <Row label="Name">
        <Field defaultValue="Alex Rivera" />
      </Row>
      <Row label="Email">
        <Field defaultValue="alex@company.com" />
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
  return (
    <Section title="Appearance" desc="Personalize how Orivox looks.">
      <Row label="Theme" hint="Dark mode is optimized for long sessions.">
        <div className="flex rounded-lg border border-border p-0.5 text-xs">
          {["Dark", "Light", "System"].map((t) => (
            <button
              key={t}
              className={`rounded-md px-3 py-1.5 ${t === "Dark" ? "bg-white/10" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Accent" hint="Used in prompts, focus rings, and highlights.">
        <div className="flex gap-2">
          <div className="glow-electric h-6 w-6 rounded-full bg-electric ring-2 ring-white/20" />
          <div className="h-6 w-6 rounded-full bg-violet" />
          <div className="h-6 w-6 rounded-full bg-emerald-500" />
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
