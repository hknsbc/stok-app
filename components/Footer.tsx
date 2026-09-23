"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { useMode } from "@/lib/ModeContext";

export default function Footer() {
  const { t, lang } = useLang();
  const { theme } = useMode();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar border-t border-sidebar-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="font-bold text-sidebar-foreground text-lg">
              {theme.appName}
            </h3>
            <p className="text-sm text-sidebar-accent-foreground/70">
              {lang === "tr" ? "Profesyonel stok yönetim ve satış takip sistemi" : "Professional stock management and sales tracking system"}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sidebar-foreground text-sm">
              {lang === "tr" ? "Hızlı Linkler" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors">
                  {t.menuHome}
                </Link>
              </li>
              <li>
                <a href="mailto:pazarlama@marssoft.com.tr" className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors">
                  {lang === "tr" ? "Destek" : "Support"}
                </a>
              </li>
              <li>
                <a href="tel:+902125551234" className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors">
                  {lang === "tr" ? "İletişim" : "Contact"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sidebar-foreground text-sm">
              {lang === "tr" ? "Yasal" : "Legal"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors">
                  {lang === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors">
                  {lang === "tr" ? "Kullanım Şartları" : "Terms of Service"}
                </Link>
              </li>
              <li>
                <Link href="/aydinlatma-metni" className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors">
                  {lang === "tr" ? "KVKK Aydınlatma Metni" : "KVKK Disclosure"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border my-6" />

        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-sidebar-accent-foreground/60">
            © {currentYear} {theme.appName} {lang === "tr" ? "Sistemi. Tüm hakları saklıdır." : "System. All rights reserved."}
          </p>
          <div className="flex items-center gap-1 text-sm text-sidebar-accent-foreground/60 mt-4 md:mt-0">
            Made with
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            by Marssoft
          </div>
        </div>
      </div>
    </footer>
  );
}
