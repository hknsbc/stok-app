import type { AppMode } from "./getMode";

export type AppTheme = {
  primary: string;
  secondary: string;
  accent: string;
  sidebar: string;
  sidebarText: string;
  appName: string;
  appTitle: string;
  panelTitle: string;
  logoEmoji: string;
};

export const themes: Record<AppMode, AppTheme> = {
  stok: {
    primary: "#6366f1",
    secondary: "#64748b",
    accent: "#4f46e5",
    sidebar: "#1a1a2e",
    sidebarText: "#ffffff",
    appName: "Stok Takip",
    appTitle: "Stok Yönetim Sistemi",
    panelTitle: "Stok Paneli",
    logoEmoji: "📦",
  },
  pet: {
    primary: "#f97316",
    secondary: "#22c55e",
    accent: "#ea580c",
    sidebar: "#1c2b1c",
    sidebarText: "#ffffff",
    appName: "PetShop",
    appTitle: "Petshop Yönetim Sistemi",
    panelTitle: "Petshop Paneli",
    logoEmoji: "🐾",
  },
  vet: {
    primary: "#0ea5e9",
    secondary: "#e2e8f0",
    accent: "#0284c7",
    sidebar: "#f0f9ff",
    sidebarText: "#0c4a6e",
    appName: "VetClinic",
    appTitle: "Veteriner Klinik Yönetim Sistemi",
    panelTitle: "Veteriner Paneli",
    logoEmoji: "🏥",
  },
  marine: {
    primary: "#06b6d4",
    secondary: "#0e7490",
    accent: "#0891b2",
    sidebar: "#0c2340",
    sidebarText: "#ffffff",
    appName: "MarineApp",
    appTitle: "Marine Bakım & Stok Sistemi",
    panelTitle: "Marine Paneli",
    logoEmoji: "⚓",
  },
};
