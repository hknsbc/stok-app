import type { AppMode } from "./getMode";

export type AppTheme = {
  primary: string;
  secondary: string;
  accent: string;
  sidebar: string;
  sidebarText: string;
  appName: string;
  logoEmoji: string;
};

export const themes: Record<AppMode, AppTheme> = {
  stok: {
    primary: "#6366f1",
    secondary: "#64748b",
    accent: "#4f46e5",
    sidebar: "#1a1a2e",
    sidebarText: "#ffffff",
    appName: "StokApp",
    logoEmoji: "📦",
  },
  pet: {
    primary: "#f97316",
    secondary: "#22c55e",
    accent: "#ea580c",
    sidebar: "#1c2b1c",
    sidebarText: "#ffffff",
    appName: "PetApp",
    logoEmoji: "🐾",
  },
  vet: {
    primary: "#0ea5e9",
    secondary: "#e2e8f0",
    accent: "#0284c7",
    sidebar: "#f0f9ff",
    sidebarText: "#0c4a6e",
    appName: "VetApp",
    logoEmoji: "🏥",
  },
};
