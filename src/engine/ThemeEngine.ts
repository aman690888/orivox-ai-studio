/**
 * ThemeEngine — Professional Presentation Theme System for Orivox V3.
 *
 * Defines curated, premium theme palettes (Gamma/Pitch/Canva style)
 * with complete typography, color gradients, surface rules, and component styling.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  secondary: string;
  accent: string;
  accentGradient: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  codeFont: string;
}

export interface PresentationTheme {
  id: string;
  name: string;
  style: "dark" | "light" | "glass" | "gradient";
  colors: ThemeColors;
  typography: ThemeTypography;
  borderRadius: string;
  shadow: string;
}

export const PRESET_THEMES: Record<string, PresentationTheme> = {
  "modern-dark": {
    id: "modern-dark",
    name: "Modern Dark (Gamma Style)",
    style: "dark",
    colors: {
      background: "#0d0f17",
      surface: "#161926",
      surfaceBorder: "#272c40",
      textPrimary: "#f8fafc",
      textSecondary: "#cbd5e1",
      textMuted: "#64748b",
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      accentGradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
      cardBg: "#1e2235",
      cardBorder: "#2e344e",
      badgeBg: "rgba(99, 102, 241, 0.2)",
      badgeText: "#818cf8",
    },
    typography: {
      headingFont: "'Outfit', 'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'Fira Code', monospace",
    },
    borderRadius: "1rem",
    shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
  },

  apple: {
    id: "apple",
    name: "Apple Minimal",
    style: "light",
    colors: {
      background: "#fbfbfd",
      surface: "#ffffff",
      surfaceBorder: "#e5e5e7",
      textPrimary: "#1d1d1f",
      textSecondary: "#515154",
      textMuted: "#86868b",
      primary: "#0071e3",
      secondary: "#2997ff",
      accent: "#0071e3",
      accentGradient: "linear-gradient(135deg, #0071e3 0%, #409cff 100%)",
      cardBg: "#ffffff",
      cardBorder: "#e8e8ed",
      badgeBg: "rgba(0, 113, 227, 0.1)",
      badgeText: "#0071e3",
    },
    typography: {
      headingFont: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      bodyFont: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif",
      codeFont: "'SF Mono', monospace",
    },
    borderRadius: "1.25rem",
    shadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
  },

  startup: {
    id: "startup",
    name: "Startup Pitch (Pitch.com Style)",
    style: "dark",
    colors: {
      background: "#09090b",
      surface: "#18181b",
      surfaceBorder: "#27272a",
      textPrimary: "#fafafa",
      textSecondary: "#a1a1aa",
      textMuted: "#71717a",
      primary: "#10b981",
      secondary: "#06b6d4",
      accent: "#f59e0b",
      accentGradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
      cardBg: "#18181b",
      cardBorder: "#27272a",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeText: "#34d399",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', 'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'JetBrains Mono', monospace",
    },
    borderRadius: "0.75rem",
    shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
  },

  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    style: "dark",
    colors: {
      background: "#05050a",
      surface: "#0d0e17",
      surfaceBorder: "#1e2238",
      textPrimary: "#ffffff",
      textSecondary: "#94a3b8",
      textMuted: "#64748b",
      primary: "#00f0ff",
      secondary: "#ff007f",
      accent: "#7000ff",
      accentGradient: "linear-gradient(135deg, #00f0ff 0%, #ff007f 100%)",
      cardBg: "#0f111e",
      cardBorder: "#1e2238",
      badgeBg: "rgba(0, 240, 255, 0.15)",
      badgeText: "#00f0ff",
    },
    typography: {
      headingFont: "'Space Grotesk', 'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'Fira Code', monospace",
    },
    borderRadius: "0.5rem",
    shadow: "0 0 20px rgba(0, 240, 255, 0.15)",
  },

  glassmorphism: {
    id: "glassmorphism",
    name: "Glassmorphism Modern",
    style: "glass",
    colors: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
      surface: "rgba(255, 255, 255, 0.07)",
      surfaceBorder: "rgba(255, 255, 255, 0.15)",
      textPrimary: "#ffffff",
      textSecondary: "#cbd5e1",
      textMuted: "#94a3b8",
      primary: "#38bdf8",
      secondary: "#c084fc",
      accent: "#f472b6",
      accentGradient: "linear-gradient(135deg, #38bdf8 0%, #c084fc 50%, #f472b6 100%)",
      cardBg: "rgba(255, 255, 255, 0.08)",
      cardBorder: "rgba(255, 255, 255, 0.18)",
      badgeBg: "rgba(56, 189, 248, 0.2)",
      badgeText: "#38bdf8",
    },
    typography: {
      headingFont: "'Outfit', 'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'Fira Code', monospace",
    },
    borderRadius: "1.25rem",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },

  corporate: {
    id: "corporate",
    name: "Corporate Executive",
    style: "light",
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      surfaceBorder: "#e2e8f0",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#94a3b8",
      primary: "#1e3a8a",
      secondary: "#0284c7",
      accent: "#d97706",
      accentGradient: "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)",
      cardBg: "#ffffff",
      cardBorder: "#cbd5e1",
      badgeBg: "rgba(30, 58, 138, 0.1)",
      badgeText: "#1e3a8a",
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'Fira Code', monospace",
    },
    borderRadius: "0.5rem",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
};

export class ThemeEngine {
  public static getTheme(themeId?: string): PresentationTheme {
    if (themeId && PRESET_THEMES[themeId]) {
      return PRESET_THEMES[themeId];
    }
    return PRESET_THEMES["modern-dark"];
  }

  public static selectBestTheme(intent: { tone?: string; audience?: string; topic?: string }): PresentationTheme {
    const text = `${intent.topic || ""} ${intent.tone || ""} ${intent.audience || ""}`.toLowerCase();

    if (text.includes("apple") || text.includes("minimal") || text.includes("design") || text.includes("clean")) {
      return PRESET_THEMES["apple"];
    }
    if (text.includes("startup") || text.includes("pitch") || text.includes("investor") || text.includes("crypto") || text.includes("fintech")) {
      return PRESET_THEMES["startup"];
    }
    if (text.includes("cyber") || text.includes("gaming") || text.includes("futuristic") || text.includes("ai")) {
      return PRESET_THEMES["cyberpunk"];
    }
    if (text.includes("creative") || text.includes("glass") || text.includes("modern")) {
      return PRESET_THEMES["glassmorphism"];
    }
    if (text.includes("corporate") || text.includes("executive") || text.includes("finance") || text.includes("bank") || text.includes("report")) {
      return PRESET_THEMES["corporate"];
    }

    return PRESET_THEMES["modern-dark"];
  }

  public static getThemeCSSVariables(theme: PresentationTheme): Record<string, string> {
    return {
      "--color-background": theme.colors.background,
      "--color-surface": theme.colors.surface,
      "--color-surface-border": theme.colors.surfaceBorder,
      "--color-text-primary": theme.colors.textPrimary,
      "--color-text-secondary": theme.colors.textSecondary,
      "--color-text-muted": theme.colors.textMuted,
      "--color-primary": theme.colors.primary,
      "--color-secondary": theme.colors.secondary,
      "--color-accent": theme.colors.accent,
      "--color-accent-gradient": theme.colors.accentGradient,
      "--color-card-bg": theme.colors.cardBg,
      "--color-card-border": theme.colors.cardBorder,
      "--color-badge-bg": theme.colors.badgeBg,
      "--color-badge-text": theme.colors.badgeText,
      "--font-heading": theme.typography.headingFont,
      "--font-body": theme.typography.bodyFont,
      "--font-code": theme.typography.codeFont,
      "--radius": theme.borderRadius,
      "--shadow": theme.shadow,
    };
  }
}
