# Orivox — Stop making boring presentations.

**The AI Presentation Operating System.** Describe your idea, and Orivox turns it into a beautifully designed, hand-drawn-aesthetic deck in seconds — no dragging boxes, no templates, just magic.

> Built with TanStack Start, Supabase, Google Gemini, and a design system that looks like it was sketched with a real pencil.

---

## ✨ Features

- **AI Deck Generation** — Describe your presentation in plain English; Gemini builds the full slide deck, titles, bullets, and layout.
- **AI Slide Refinement** — "Make it punchier", "More visual", or any custom prompt instantly rewrites the active slide.
- **Workspace Editor** — Full slide canvas with an AI chat assistant, zoom controls, and a slide thumbnail strip.
- **Present Mode** — Full-screen viewer with keyboard navigation, a mobile slide-up AI assistant drawer, and real-time refinement.
- **Export** — One-click export to PPTX (PowerPoint), PDF, or HTML via `pptxgenjs`.
- **Auth** — Supabase-backed email/password authentication with protected routes.
- **Mobile-First** — Purpose-built responsive experience from 320 px phones to 1440 px desktops; bottom navigation bar, slide-over drawers, and touch-friendly controls.
- **Command Palette** — ⌘K quick-search across your decks.
- **Hand-Drawn Design System** — Kalam & Patrick Hand typefaces, wobbly border radii, offset box shadows, and a warm textured background.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite + Nitro) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + custom design tokens |
| UI Primitives | [Radix UI](https://radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Animation | [Motion (Framer Motion v12)](https://motion.dev) |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL + Row-Level Security) |
| AI | [Google Gemini 2.5 Flash](https://ai.google.dev) via `@google/genai` |
| Charts | [Recharts](https://recharts.org) |
| Diagrams | [Mermaid.js](https://mermaid.js.org) |
| Export | [pptxgenjs](https://gitbrent.github.io/PptxGenJS) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com) / [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20+ or [Bun](https://bun.sh) 1.1+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone & Install

```bash
git clone https://github.com/aman690888/orivox-ai-studio.git
cd orivox-ai-studio
npm install
# or: bun install
```

### 2. Configure Environment Variables

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `GEMINI_API_KEY` | Google Gemini API key (server-side) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key (client-side fallback) |

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
src/
├── routes/            # File-based pages (TanStack Router)
│   ├── index.tsx      # Marketing landing page
│   ├── auth.tsx       # Sign in / Sign up
│   ├── _app.tsx       # Authenticated shell (sidebar, bottom nav)
│   ├── _app.home.tsx  # Dashboard
│   ├── _app.presentations.tsx  # My Decks
│   ├── _app.settings.tsx       # Account & preferences
│   ├── workspace.$id.tsx       # Slide editor + AI chat
│   ├── present.$id.tsx         # Presentation viewer
│   └── export.$id.tsx          # Export center
├── components/        # Shared UI components
├── lib/
│   └── ai/            # Gemini integration & server functions
├── renderer/          # Slide rendering engine (layouts, components)
├── compiler/          # Presentation IR compiler
├── engine/            # ThemeEngine & design tokens
├── orchestrator/      # AI key management & orchestration
└── types/             # Shared TypeScript types
```

---

## 📜 Available Scripts

```bash
npm run dev        # Start dev server (hot reload)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
npm run format     # Prettier
```

---

## 🌐 Deployment

The project is configured for **Cloudflare Workers** via Nitro and is also fully compatible with **Vercel**.

```bash
# Cloudflare
npm run build
npx nitro deploy --prebuilt

# Vercel
vercel --prod
```

Make sure your environment variables are set in your deployment dashboard.

---

## 🗄 Database

Supabase migrations live in `supabase/migrations/`. To apply them to a new project:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

---

## 📄 License

MIT © Aman
