import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";

export const metadata: Metadata = {
  title: "Stok Takip",
  description: "Stok Yonetim Sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
