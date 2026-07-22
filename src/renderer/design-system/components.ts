export const components = {
  icons: {
    sm: "1rem", // 16px
    md: "1.5rem", // 24px
    lg: "2rem", // 32px
    xl: "3rem", // 48px
  },
  cards: {
    minHeight: "150px",
    padding: "var(--spacing-6)", // Will map from our spacing system
  },
  layout: {
    slideMaxWidth: "1280px",
    slideAspectRatio: "16/9",
    sidebarWidth: "350px",
    gap: "var(--spacing-8)",
  }
} as const;
