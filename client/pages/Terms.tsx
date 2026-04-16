import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Kullanıcı Sözleşmesi
              </h1>
              <p className="text-muted-foreground mt-1">
                Hizmet Kullanım Şartları ve Koşulları
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
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Kabul ve Uyum</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu Sözleşmeyi ("Şartlar") okuyup kabul ederek, Stok Takip Sistemi
              ("Platform", "Hizmet") üzerinde hesap oluşturmayı ve hizmeti kullanmayı
              kabul ediyorsunuz. Şartları kabul etmiyorsanız, lütfen Hizmeti
              kullanmayınız.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Hesap Oluşturma
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">2.1 Sorumluluk</span>
              </p>
              <p>
                Hesap bilgilerinizi sağlarken doğru ve güncel bilgiler vereceğinizi
                taahhüt edersiniz. Kullanıcı adı ve şifrenizin gizliliğinden ve
                hesabınız altında yapılan tüm etkinliklerden siz sorumlusunuz.
              </p>
              <p>
                <span className="font-semibold text-foreground">2.2 Yaş Şartı</span>
              </p>
              <p>
                Hizmeti kullanmak için en az 18 yaşında olmalı ve yasal olarak
                sözleşme yapabiliyor olmalısınız.
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. Hizmet Kullanımı
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">3.1 Yasallık</span>
              </p>
              <p>
                Hizmeti herhangi bir yasa veya yönetmeliği ihlal etmeden kullanmayı
                kabul edersiniz.
              </p>
              <p>
                <span className="font-semibold text-foreground">3.2 Yasak Faaliyetler</span>
              </p>
              <p className="mb-2">Aşağıdakileri yapmamalısınız:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Kötü amaçlı yazılım veya virüs göndermek</li>
                <li>Hizmete yetkisiz erişim sağlamaya çalışmak</li>
                <li>Başkasının verilerini çalmak</li>
                <li>Spam veya taciz gönderilen</li>
                <li>Fikri mülkiyet haklarını ihlal etmek</li>
                <li>Diğer kullanıcıları aldatmak veya yanıltmak</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Fikri Mülkiyet Hakları
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Platform, yazılım, tasarım, metin ve tüm içerik bize aittir ve telif
              hakkı korumasında. Hizmeti kişisel kullanım için açık sözleşme dışında
              çoğaltma, dağıtma veya değiştirme izni verilmez.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Ödeme ve Abonelik
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">5.1 Ücretler</span>
              </p>
              <p>
                Seçtiğiniz plan için belirtilen ücretleri ödemeyi kabul edersiniz.
                Ücretler değişebilir ve değişikliğe konu olabilir.
              </p>
              <p>
                <span className="font-semibold text-foreground">5.2 Geri Ödeme</span>
              </p>
              <p>
                Abonelik ücretleri genellikle geri ödenmez, aksi belirtilmedikçe.
              </p>
              <p>
                <span className="font-semibold text-foreground">5.3 Ödeme Yöntemi</span>
              </p>
              <p>
                Kredi kartı veya diğer ödeme yöntemleri kullanarak ödeme yapabilirsiniz.
                Ödeme bilgileriniz güvenli şekilde işlenir.
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Sorumluluğun Sınırlandırılması
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Hizmet "olduğu gibi" ("AS IS") sağlanır. İmzalı veya zımni hiçbir garanti
              olmaksızın:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Hizmete erişimde kesintiler</li>
              <li>Veri kaybı veya bozulması</li>
              <li>Güvenlik ihlalleri (makul önlemlere rağmen)</li>
              <li>Hizmetin ticari amaçlara uygunluğu</li>
            </ul>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Hizmetin Sonlandırılması
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Şartları ihlal ederseniz veya yasaları çiğnerseniz, hesabınızı
              derhal sonlandırabilir veya askıya alabiliriz. Sonlandırma durumunda,
              verileriniz belirli bir dönem sonra silinecektir.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Değişiklikler
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu Şartları istediğimiz zaman değiştirme hakkını saklı tutarız.
              Önemli değişiklikleri size bildireceğiz. Değişikliklerden sonra
              Hizmeti kullanmaya devam etmek, yeni şartları kabul anlamındadır.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Yürürlük Kanunu
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu Sözleşme Türkiye Cumhuriyeti kanunlarına tabi. Anlaşmazlıklar,
              İstanbul mahkemeleri tarafından karara bağlanacaktır.
            </p>
          </Card>

          <Card className="p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              10. İletişim
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bu Şartlar hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">E-posta:</span>{" "}
                legal@stoktakip.com
              </p>
              <p>
                <span className="font-semibold text-foreground">Adres:</span>{" "}
                İstanbul, Türkiye
              </p>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-6 border border-primary/30 bg-primary/5">
            <h3 className="font-semibold text-foreground mb-2">
              Onay ve Kabul
            </h3>
            <p className="text-muted-foreground mb-4">
              Hizmeti kullanarak, bu Kullanıcı Sözleşmesini okudunuz ve
              kabul ettiğiniz kabul edilir.
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
