import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

export default function KVKK() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Gizlilik Politikası
              </h1>
              <p className="text-muted-foreground mt-1">
                Kişisel Verilerin Korunması Kanunu (KVKK)
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Son güncelleme: Ocak 2024
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Giriş</h2>
            <p className="text-muted-foreground leading-relaxed">
              Stok Takip Sistemi ("Şirket", "biz", "bizim") olarak, kişisel
              verilerinizin gizliliğini ve güvenliğini önemsiyoruz. Bu Gizlilik
              Politikası, web sitesi ve uygulamalarımızı ("Hizmet") kullandığında
              bilgilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve
              korunduğunu açıklar.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Topladığımız Bilgiler
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  2.1 Doğrudan Sağladığınız Bilgiler
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hesap oluşturduğunuzda (ad, e-posta, şifre)</li>
                  <li>Profil bilgilerinizi güncellerken</li>
                  <li>Destek talep ettiğinizde</li>
                  <li>Müşteri araştırmalarımıza katıldığınızda</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  2.2 Otomatik Olarak Toplanan Bilgiler
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>IP adresi ve cihaz bilgileri</li>
                  <li>Tarayıcı türü ve sürümü</li>
                  <li>Erişim tarih ve saatleri</li>
                  <li>Ziyaret edilen sayfalar ve hareketleriniz</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. Bilgileri Nasıl Kullanırız
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Hizmeti sağlamak ve geliştirmek</li>
                <li>Hesabınızı yönetmek ve destek sunmak</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>Hukuki yükümlülükleri yerine getirmek</li>
                <li>
                  (Onayınızla) pazarlama iletişimi göndermek
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Veri Paylaşımı
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflara
              paylaşılmaz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Hizmet Sağlayıcılar</span>: İş ortaklarımız
                hizmeti sunmamıza yardımcı olur (örn: ödeme işlemcileri, bulut
                depolama)
              </li>
              <li>
                <span className="font-semibold text-foreground">Yasal Zorunluluk</span>: Yasa, yönetmelik
                veya hukuki talep gerektirdiğinde
              </li>
              <li>
                <span className="font-semibold text-foreground">İzniniz</span>: Açık onayınız olmadan
                başka hiçbir şekilde paylaşılmaz
              </li>
            </ul>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Veri Güvenliği
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Kişisel verilerinizi korumak için endüstri standardı uygulamaları
              kullanırız:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-3">
              <li>SSL/TLS şifrelemesi</li>
              <li>Güvenli şifre saklama (hashing)</li>
              <li>Erişim kontrolü ve izinlendirme</li>
              <li>Düzenli güvenlik denetimleri</li>
            </ul>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Haklarınız
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              KVKK uyarınca, aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Erişim Hakkı</span>: Hakkınızda hangi verilerin
                toplandığını öğrenme
              </li>
              <li>
                <span className="font-semibold text-foreground">Düzeltme Hakkı</span>: Yanlış verileri
                düzeltme
              </li>
              <li>
                <span className="font-semibold text-foreground">Silme Hakkı</span>: Verilerinizin
                silinmesini talep etme
              </li>
              <li>
                <span className="font-semibold text-foreground">İzin Geri Çekme</span>: Daha önce verdiğiniz
                izni geri çekme
              </li>
              <li>
                <span className="font-semibold text-foreground">Taşınabilirlik</span>: Verilerinizi başka
                platformlara aktarma
              </li>
            </ul>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Çerezler
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizmetimizi geliştirmek ve kullanıcı deneyimini iyileştirmek için
              çerezler kullanırız. Tarayıcınızın ayarlarından çerezleri
              kontrol edebilirsiniz.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. İletişim
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Gizlilik politikamız hakkında sorularınız varsa, lütfen bizimle
              iletişime geçin:
            </p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">E-posta:</span>{" "}
                privacy@stoktakip.com
              </p>
              <p>
                <span className="font-semibold text-foreground">Adres:</span>{" "}
                İstanbul, Türkiye
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Politika Değişiklikleri
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu Gizlilik Politikasını herhangi bir zamanda güncelleme hakkını
              saklı tutarız. Önemli değişiklikleri e-posta ile bildireceğiz.
            </p>
          </Card>

          {/* CTA */}
          <Card className="p-6 border border-primary/30 bg-primary/5">
            <p className="text-muted-foreground mb-4">
              Bu gizlilik politikasını okuduğunuz için teşekkür ederiz. Sorularınız varsa
              bize ulaşmaktan çekinmeyin.
            </p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
