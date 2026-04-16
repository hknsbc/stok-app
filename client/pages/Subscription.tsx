import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Calendar,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";

const currentPlan = {
  name: "Pro",
  price: 299,
  billing: "aylık",
  startDate: "2024-01-01",
  expiryDate: "2024-12-31",
  daysRemaining: 312,
};

const features = [
  {
    category: "Temel Özellikler",
    items: [
      { name: "Sınırsız Cari Kartı", included: true },
      { name: "Sınırsız Stok Takibi", included: true },
      { name: "Satış ve Alış Modülü", included: true },
      { name: "Temel Raporlar", included: true },
      { name: "Mobil Uygulama", included: true },
    ],
  },
  {
    category: "İleri Özellikler",
    items: [
      { name: "Otomatik Raporlar", included: true },
      { name: "Çok Kullanıcı Desteği", included: true },
      { name: "API Erişimi", included: true },
      { name: "Veri Yedeklemesi", included: true },
      { name: "Özel Entegrasyon", included: false },
    ],
  },
  {
    category: "Destek",
    items: [
      { name: "E-posta Desteği", included: true },
      { name: "Canlı Chat Desteği", included: true },
      { name: "Telefon Desteği", included: false },
      { name: "Dedike Destek Temsilcisi", included: false },
    ],
  },
];

const plans = [
  {
    name: "Başlangıç",
    price: 99,
    period: "aylık",
    description: "Küçük işletmeler için ideal",
    badge: null,
    limits: {
      users: 1,
      storage: "5 GB",
      reports: "Temel",
    },
  },
  {
    name: "Pro",
    price: 299,
    period: "aylık",
    description: "Orta ölçekli işletmeler için",
    badge: "Mevcut Plan",
    limits: {
      users: 5,
      storage: "100 GB",
      reports: "Gelişmiş",
    },
  },
  {
    name: "Enterprise",
    price: 999,
    period: "aylık",
    description: "Büyük işletmeler için özelleştirilebilir",
    badge: null,
    limits: {
      users: "Sınırsız",
      storage: "Sınırsız",
      reports: "Tüm Raporlar",
    },
  },
];

export default function Subscription() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Abonelik</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Abonelik planınızı yönetin ve güncelleyin
          </p>
        </div>

        {/* Current Plan Overview */}
        <Card className="p-6 border border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Mevcut Plan
                </span>
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {currentPlan.name}
              </h3>
              <p className="text-lg text-muted-foreground mt-1">
                ₺{currentPlan.price}/{currentPlan.billing}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {currentPlan.daysRemaining}
              </div>
              <p className="text-sm text-muted-foreground">gün kaldı</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/30">
            <div>
              <p className="text-xs text-muted-foreground">Başlama Tarihi</p>
              <p className="font-semibold text-foreground mt-1">
                {new Date(currentPlan.startDate).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bitiş Tarihi</p>
              <p className="font-semibold text-foreground mt-1">
                {new Date(currentPlan.expiryDate).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Durum</p>
              <p className="font-semibold text-green-600 mt-1">Aktif</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yenileme Tarihi</p>
              <p className="font-semibold text-foreground mt-1">Otomatik</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2">
              <CreditCard className="w-4 h-4" />
              Faturalama
            </Button>
            <Button variant="outline" className="border-border/50">
              İptal Et
            </Button>
          </div>
        </Card>

        {/* Warnings */}
        {currentPlan.daysRemaining < 60 && (
          <Card className="p-4 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">
                  Aboneliğiniz yakında sona erecek
                </h4>
                <p className="text-sm text-amber-800 mt-1">
                  {currentPlan.daysRemaining} gün içinde aboneliğiniz sona
                  erecektir. Hizmeti kesintisiz kullanmak için
                  yenileyiniz.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Available Plans */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Tüm Planlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative p-6 border transition-all ${
                  plan.badge
                    ? "border-primary/50 bg-primary/5 shadow-lg"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-foreground">
                    {plan.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    ₺{plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Kullanıcı:
                    </span>
                    <span className="font-medium text-foreground">
                      {plan.limits.users}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Depolama:
                    </span>
                    <span className="font-medium text-foreground">
                      {plan.limits.storage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Raporlar:
                    </span>
                    <span className="font-medium text-foreground">
                      {plan.limits.reports}
                    </span>
                  </div>
                </div>

                <Button
                  className={`w-full gap-2 ${
                    plan.badge
                      ? "bg-gray-400 text-white cursor-default hover:bg-gray-400"
                      : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                  }`}
                  disabled={!!plan.badge}
                >
                  {plan.badge ? "Mevcut Plan" : "Yükselt"}
                  {!plan.badge && <ArrowRight className="w-4 h-4" />}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Plan Özellikleri
          </h3>
          <div className="space-y-6">
            {features.map((category) => (
              <Card key={category.category} className="p-6 border border-border/50">
                <h4 className="font-semibold text-foreground mb-4">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 py-2"
                    >
                      {item.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          item.included
                            ? "text-foreground"
                            : "text-muted-foreground line-through"
                        }
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Ödeme Yöntemleri
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Kredi Kartı</p>
                  <p className="text-xs text-muted-foreground">
                    Visa, Mastercard, Amex
                  </p>
                </div>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Banka Transferi</p>
                  <p className="text-xs text-muted-foreground">
                    Türkiye'den
                  </p>
                </div>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
