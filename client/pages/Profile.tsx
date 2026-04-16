import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Building, Calendar, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return <DashboardLayout>Yükleniyor...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="w-6 h-6" />
            Profil ve Ayarlar
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hesap bilgilerinizi ve ayarlarınızı yönetin
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Hesap Bilgileri
          </h3>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Kullanıcı Adı
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                <User className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  {user.username}
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                E-posta Adresi
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Şirket / İşletme Adı
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                <Building className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  {user.company}
                </span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Kullanıcı Rolü
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                <Shield className="w-5 h-5 text-primary" />
                {user.role === "admin" ? (
                  <>
                    <span className="text-foreground font-medium">
                      Yönetici (Admin)
                    </span>
                    <span className="ml-auto text-xs px-2 py-1 bg-purple-500/10 text-purple-600 rounded font-semibold">
                      Tam Erişim
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-foreground font-medium">
                      Standart Kullanıcı
                    </span>
                    <span className="ml-auto text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded font-semibold">
                      Sınırlı Erişim
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Hesap Durumu
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-foreground font-medium">Aktif</span>
              </div>
            </div>

            {/* Join Date */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Üyelik Tarihi
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLogin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Son Giriş
                </label>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">
                    {new Date(user.lastLogin).toLocaleDateString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Account Management */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Hesap Yönetimi
          </h3>

          <div className="space-y-3">
            {user.role === "admin" && (
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white justify-start"
                variant="default"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Paneline Git
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full border-border/50 justify-start hover:bg-muted"
            >
              <Mail className="w-4 h-4 mr-2" />
              E-posta Adresini Değiştir
            </Button>

            <Button
              variant="outline"
              className="w-full border-border/50 justify-start hover:bg-muted"
            >
              Şifre Değiştir
            </Button>

            <Button
              variant="outline"
              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </Card>

        {/* Security Info */}
        <Card className="p-6 border border-blue-500/30 bg-blue-500/5">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Güvenlik Bilgisi
          </h3>
          <p className="text-sm text-blue-800">
            Verileriniz SSL/TLS şifrelemesi ile korunmaktadır. Hesabınızın
            güvenliğini sağlamak için düzenli olarak şifrenizi değiştirmeniz
            önerilir.
          </p>
        </Card>

        {/* Privacy & Terms */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Yasal Bilgiler
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Hizmetimizi kullanarak aşağıdaki belgeleri kabul etmiş olursunuz:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <a href="/kvkk" className="text-primary hover:underline">
                  Gizlilik Politikası (KVKK)
                </a>
              </li>
              <li>
                <a href="/terms" className="text-primary hover:underline">
                  Kullanıcı Sözleşmesi
                </a>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
