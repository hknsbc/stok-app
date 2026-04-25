import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";
import { ModeProvider } from "@/lib/ModeContext";
import { getMode } from "@/lib/getMode";
import { themes } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Stok Takip",
  description: "Stok Yonetim Sistemi",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = await getMode();
  const theme = themes[mode];

  return (
    <html lang="tr">
      <head>
        {/* Inject theme CSS variables so any inline-style component can reference them */}
        <style>{`
          :root {
            --color-primary: ${theme.primary};
            --color-secondary: ${theme.secondary};
            --color-accent: ${theme.accent};
            --color-sidebar: ${theme.sidebar};
            --color-sidebar-text: ${theme.sidebarText};
          }
        `}</style>
      </head>
      <body>
        <ModeProvider mode={mode}>
          <LangProvider>{children}</LangProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
