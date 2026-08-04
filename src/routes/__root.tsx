import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
};

function NotFoundComponent() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{
        background: "#fdfbf7",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div
        className="p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d] flex flex-col items-center gap-5 max-w-md"
        style={{ borderRadius: R.card }}
      >
        <div className="text-5xl">🧭</div>
        <h1 className="text-4xl font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
          404 Not Found
        </h1>
        <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:text-[#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{
        background: "#fdfbf7",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div
        className="p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d] flex flex-col items-center gap-5 max-w-md"
        style={{ borderRadius: R.card }}
      >
        <div className="text-5xl">😬</div>
        <h1 className="text-2xl font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
          Something went wrong
        </h1>
        <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
          We hit an unexpected error. You can try refreshing or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#ff4d4d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:text-[#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function PendingComponent() {
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
        className="flex flex-col items-center gap-4 p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d]"
        style={{ borderRadius: R.card }}
      >
        <div
          className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-3xl animate-bounce shadow-[3px_3px_0px_0px_#2d2d2d]"
          style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
        >
          ✏️
        </div>
        <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Orivox — Ideas to Beautiful Presentations" },
      {
        name: "description",
        content:
          "Orivox is the AI Presentation Operating System. Describe an idea; the AI researches, outlines, designs, and refines your presentation.",
      },
      { name: "author", content: "Orivox" },
      { property: "og:title", content: "Orivox — Ideas to Beautiful Presentations" },
      { property: "og:description", content: "The AI Presentation Operating System." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fqsevharcyjdwbtrlltz.supabase.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('orivox-theme');
                  var accent = localStorage.getItem('orivox-accent');
                  var root = document.documentElement;
                  if (theme === 'dark' || theme === 'light') {
                    root.classList.remove('dark', 'light');
                    root.classList.add(theme);
                  } else {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.remove('dark', 'light');
                    root.classList.add(systemTheme);
                  }
                  if (accent) {
                    root.setAttribute('data-accent', accent);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "../lib/auth-context";
import { ThemeProvider } from "../lib/theme-context";
import { useState } from "react";

function DynamicFontLoader() {
  const [fonts, setFonts] = useState<string[]>(["Geist", "Geist Mono"]);

  useEffect(() => {
    const handleLoadFonts = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.fonts) {
        setFonts((prev) => {
          const set = new Set([...prev, ...customEvent.detail.fonts]);
          return Array.from(set);
        });
      }
    };
    window.addEventListener("orivox:load-fonts", handleLoadFonts);
    return () => window.removeEventListener("orivox:load-fonts", handleLoadFonts);
  }, []);

  const familyParam = fonts
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return (
    <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${familyParam}&display=swap`} fetchPriority="high" />
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          <Toaster />
          <DynamicFontLoader />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
