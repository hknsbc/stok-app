import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Zap,
  Calendar,
  Server,
  Download,
} from "lucide-react";
import { useState } from "react";

const licenseInfo = {
  status: "Aktif",
  licenseKey: "STK-PRO-2024-XXXX-XXXX-XXXX",
  expiryDate: "2024-12-31",
  daysRemaining: 312,
  registeredTo: "Ayakkabı Ltd. Şti.",
  email: "admin@ayakkabi.com.tr",
  installationDate: "2024-01-01",
  maxUsers: 5,
  maxDevices: 3,
  activatedDevices: 2,
};

export default function License() {
  const [copied, setCopied] = useState(false);

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(licenseInfo.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpiringSoon = licenseInfo.daysRemaining < 60;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lisans</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Lisans bilgilerini ve aktivasyonunu yönetin
          </p>
        </div>

        {/* License Status */}
        <Card
          className={`p-6 border ${
            licenseInfo.status === "Aktif"
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {licenseInfo.status === "Aktif" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  Lisans Durumu
                </span>
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {licenseInfo.status}
              </h3>
              <p className="text-muted-foreground mt-2">
                {licenseInfo.registeredTo}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-sm font-semibold text-green-600">
                  {licenseInfo.daysRemaining} gün
                </p>
                <p className="text-xs text-green-600">kaldı</p>
              </div>
            </div>
          </div>

          {isExpiringSoon && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-sm text-muted-foreground">
                ⚠️ Lisansınız yakında sona erecektir.{" "}
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto underline"
                >
                  Şimdi yenileyin
                </Button>
              </p>
            </div>
          )}
        </Card>

        {/* License Key */}
        <Card className="p-6 border border-border/50">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Lisans Anahtarı
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Bu anahtarı güvenli bir yerde saklayın
              </p>
            </div>

            <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/30 font-mono">
              <span className="flex-1 text-foreground select-all">
                {licenseInfo.licenseKey}
              </span>
              <Button
                onClick={handleCopyLicense}
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* License Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sona Erme Tarihi</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {new Date(licenseInfo.expiryDate).toLocaleDateString(
                    "tr-TR"
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Kurulum Tarihi
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {new Date(licenseInfo.installationDate).toLocaleDateString(
                    "tr-TR"
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-posta</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {licenseInfo.email}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Server className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kuruluş Adı</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {licenseInfo.registeredTo}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* User & Device Limits */}
        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-6">
            Kullanıcı ve Cihaz Limitleri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Maksimum Kullanıcı
                </p>
                <p className="font-semibold text-foreground">
                  {licenseInfo.maxUsers}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Aktif Kullanıcılar</p>
                  <p className="text-sm font-medium text-foreground">3 / 5</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            </div>

            {/* Devices */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Maksimum Cihaz</p>
                <p className="font-semibold text-foreground">
                  {licenseInfo.maxDevices}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Etkinleştirilmiş Cihazlar
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {licenseInfo.activatedDevices} / {licenseInfo.maxDevices}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(licenseInfo.activatedDevices / licenseInfo.maxDevices) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Registered Devices */}
        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">
            Kayıtlı Cihazlar
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-foreground">Bilgisayar 1</p>
                <p className="text-xs text-muted-foreground">
                  Windows 10 - 192.168.1.100
                </p>
                <p className="text-xs text-green-600 mt-1">Aktif</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Etkinleştirilme</p>
                <p className="text-sm font-medium text-foreground">
                  2024-01-01
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-foreground">Bilgisayar 2</p>
                <p className="text-xs text-muted-foreground">
                  Windows 11 - 192.168.1.101
                </p>
                <p className="text-xs text-green-600 mt-1">Aktif</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Etkinleştirilme</p>
                <p className="text-sm font-medium text-foreground">
                  2024-01-05
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-border/50 text-foreground hover:bg-muted"
            >
              Yeni Cihaz Ekle
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2 flex-1">
            <Download className="w-4 h-4" />
            Lisansı Yenile
          </Button>
          <Button
            variant="outline"
            className="border-border/50 text-foreground hover:bg-muted flex-1"
          >
            Yardım ve Destek
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
