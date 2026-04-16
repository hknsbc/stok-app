import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Cari",
    description: "Müşteri ve tedarikçi kartlarını yönetin",
    icon: Users,
    path: "/customers",
    color: "from-blue-500 to-cyan-500",
    stat: "45",
    statLabel: "Kayıtlı Cari",
  },
  {
    label: "Stok",
    description: "Ürün envanterini takip edin",
    icon: Package,
    path: "/inventory",
    color: "from-purple-500 to-pink-500",
    stat: "1,234",
    statLabel: "Toplam Stok",
  },
  {
    label: "Alışlar",
    description: "Satın alma işlemlerini kaydedin",
    icon: ShoppingCart,
    path: "/purchases",
    color: "from-green-500 to-emerald-500",
    stat: "28",
    statLabel: "Bu Ay",
  },
  {
    label: "Satışlar",
    description: "Satış işlemlerini yönetin",
    icon: BarChart3,
    path: "/sales",
    color: "from-orange-500 to-red-500",
    stat: "156",
    statLabel: "Bu Ay",
  },
  {
    label: "Raporlar",
    description: "Detaylı analiz ve raporlar",
    icon: FileText,
    path: "/reports",
    color: "from-indigo-500 to-blue-500",
    stat: "12",
    statLabel: "Oluşturulan",
  },
  {
    label: "Abonelik",
    description: "Abonelik durumunuzu kontrol edin",
    icon: CreditCard,
    path: "/subscription",
    color: "from-amber-500 to-yellow-500",
    stat: "Pro",
    statLabel: "Plan",
  },
  {
    label: "Lisans",
    description: "Lisans ve aktivasyon bilgileri",
    icon: Shield,
    path: "/license",
    color: "from-teal-500 to-green-500",
    stat: "Aktif",
    statLabel: "Durum",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-border/50 p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Hoş Geldiniz! {user?.username}
              </h2>
              <p className="text-muted-foreground">
                Stok yönetim sisteminize giriş yaptınız. Aşağıdan işlemlerinizi
                başlatabilirsiniz.
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg opacity-20" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Cari</p>
                <p className="text-2xl font-bold text-foreground mt-1">45</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stok Değeri</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  1,234
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bu Ay Satışlar</p>
                <p className="text-2xl font-bold text-foreground mt-1">₺45K</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lisans Durumu</p>
                <p className="text-2xl font-bold text-foreground mt-1">Aktif</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Sections Grid */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Ana Modüller
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <Link key={section.path} to={section.path} className="group">
                  <Card className="h-full p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center shadow-lg",
                          `bg-gradient-to-br ${section.color}`
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {section.stat}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {section.statLabel}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">
                          {section.label}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground group-hover:shadow-lg transition-all"
                      >
                        <span>Aç</span>
                      </Button>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <Card className="p-6 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Uyarı</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Lisansınız 45 gün sonra sona erecektir. Devam etmek için
                aboneliğinizi güncellemeyi unutmayın.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
