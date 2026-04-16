import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar border-t border-sidebar-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-sidebar-foreground text-lg">
              Stok Takip
            </h3>
            <p className="text-sm text-sidebar-accent-foreground/70">
              Profesyonel stok yönetim ve satış takip sistemi
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sidebar-foreground text-sm">
              Hızlı Linkler
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@staktakip.com"
                  className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors"
                >
                  Destek
                </a>
              </li>
              <li>
                <a
                  href="tel:+902125551234"
                  className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors"
                >
                  İletişim
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sidebar-foreground text-sm">
              Yasal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/kvkk"
                  className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors"
                >
                  Gizlilik Politikası (KVKK)
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sidebar-accent-foreground/70 hover:text-sidebar-primary transition-colors"
                >
                  Kullanıcı Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-sidebar-accent-foreground/60">
            © {currentYear} Stok Takip Sistemi. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-1 text-sm text-sidebar-accent-foreground/60 mt-4 md:mt-0">
            Made with
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            by Stok Takip Team
          </div>
        </div>
      </div>
    </footer>
  );
}
