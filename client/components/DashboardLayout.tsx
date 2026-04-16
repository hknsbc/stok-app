import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  Menu,
  X,
  LogOut,
  Home,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { label: "Ana Sayfa", path: "/", icon: Home },
  { label: "Cari", path: "/customers", icon: Users },
  { label: "Stok", path: "/inventory", icon: Package },
  { label: "Alışlar", path: "/purchases", icon: ShoppingCart },
  { label: "Satışlar", path: "/sales", icon: BarChart3 },
  { label: "Raporlar", path: "/reports", icon: FileText },
  { label: "Abonelik", path: "/subscription", icon: CreditCard },
  { label: "Lisans", path: "/license", icon: Shield },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || "Kullanıcı";
  const userRole = user?.role || "user";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-sidebar border-r border-sidebar-border",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-sidebar-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-sidebar-foreground">
                  Stok Takip
                </div>
                <div className="text-xs text-sidebar-accent-foreground/70">
                  Sistemi
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent/50 p-2 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar-accent text-sidebar-accent-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {sidebarOpen && (
            <div className="px-4 py-2 bg-sidebar-accent/30 rounded-lg text-xs">
              <p className="text-sidebar-accent-foreground font-medium truncate">
                {username}
              </p>
              <p className="text-sidebar-accent-foreground/60 text-xs mt-1">
                {userRole === "admin" ? "Yönetici" : "Kullanıcı"}
              </p>
            </div>
          )}
          <Link to="/profile">
            <Button
              variant="ghost"
              className={cn(
                "w-full text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                !sidebarOpen && "p-2 h-10 w-10"
              )}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">Profil</span>}
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              !sidebarOpen && "p-2 h-10 w-10"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="ml-3">Çıkış</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 overflow-auto flex flex-col",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-foreground hover:bg-muted p-2 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.label || "Sayfa"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {new Date().toLocaleDateString("tr-TR")}
              </span>
              {userRole === "admin" && (
                <Link to="/admin/users">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10 gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Admin Panel</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
