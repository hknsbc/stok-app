import LegalPage from "@/components/legal/LegalPage";

export const metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      lastUpdated="12 Ağustos 2026"
      intro="Bu Gizlilik Politikası, Marssoft tarafından işletilen stok, petshop, veteriner ve marina yönetim yazılımlarını (stok.marssoft.com.tr, pet.marssoft.com.tr, vet.marssoft.com.tr, marine.marssoft.com.tr) kullanan işletmelerin ve bu işletmeler adına hesap açan kullanıcıların kişisel verilerinin nasıl işlendiğini açıklar."
      sections={[
        {
          heading: "Veri Sorumlusu",
          body: [
            "Kişisel verileriniz, veri sorumlusu sıfatıyla aşağıdaki bilgilere sahip şirket (\"Marssoft\") tarafından işlenmektedir:",
            {
              list: [
                "Unvan: Mars Yazılım ve Bilişim Sistemleri",
                "Mersis No: 3476249195000011",
                "Ticaret Sicil No: 18968-5",
                "Adres: Küçükbakkalköy Mah. Selvili Sk. No: 4 İç Kapı No: 20 Ataşehir/İstanbul",
                "E-posta: pazarlama@marssoft.com.tr",
              ],
            },
          ],
        },
        {
          heading: "Toplanan Veriler",
          body: [
            "Hizmetlerimizi kullanırken aşağıdaki kişisel veri kategorileri işlenebilir:",
            {
              list: [
                "Kimlik ve iletişim bilgileri: ad, e-posta, telefon, firma adı",
                "Hesap bilgileri: kullanıcı adı, şifre (şifrelenmiş biçimde), abonelik planı",
                "İşletme verileri: ürün/stok kayıtları, cari hesap, satış/alış kayıtları ve kullandığınız modüle göre değişen operasyonel veriler (ör. hasta kartı, tekne kartı, pet kartı)",
                "Kullanım verileri: giriş zamanları, ziyaret edilen sayfalar, oturum süresi (hizmet kalitesini ölçmek ve destek sağlamak amacıyla)",
                "Teknik veriler: IP adresi, tarayıcı bilgisi, cihaz bilgisi",
              ],
            },
          ],
        },
        {
          heading: "Kullanım Amacı",
          body: [
            "Toplanan veriler; hizmetin sunulması ve sürdürülmesi, hesabınızın oluşturulması ve güvenliğinin sağlanması, faturalandırma ve abonelik yönetimi, müşteri desteği sağlanması, hizmet kalitesinin ve kullanıcı deneyiminin iyileştirilmesi ve (onay vermeniz halinde) ticari elektronik ileti gönderilmesi amaçlarıyla işlenir.",
          ],
        },
        {
          heading: "Saklama ve Güvenlik",
          body: [
            "Verileriniz, Avrupa Birliği ve Türkiye'de yaygın olarak kullanılan, endüstri standardı güvenlik önlemlerine sahip bulut altyapı sağlayıcıları üzerinde barındırılır. Verilere erişim yetkilendirme ve şifreleme ile sınırlandırılmıştır. Veriler, hesabınız aktif olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca saklanır; hesap kapatma taleplerinde mevzuaten zorunlu olmayan veriler makul bir süre içinde silinir veya anonimleştirilir.",
          ],
        },
        {
          heading: "Üçüncü Taraf Hizmetler",
          body: [
            "Hizmetin sunulabilmesi için sınırlı amaçlarla üçüncü taraf altyapı ve hizmet sağlayıcılarından (ör. veritabanı ve barındırma hizmeti, e-posta/bildirim servisleri, ödeme altyapısı) faydalanılabilir. Bu sağlayıcılarla veriler yalnızca hizmetin ifası için gerekli ölçüde paylaşılır ve sağlayıcılar sözleşmesel olarak veri güvenliği yükümlülükleri altındadır.",
          ],
        },
        {
          heading: "KVKK Kapsamındaki Haklarınız",
          body: [
            "6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, mevzuatta öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme ve bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz. Detaylı bilgi için Aydınlatma Metni'ni inceleyebilirsiniz.",
          ],
        },
        {
          heading: "Çerezler",
          body: [
            "Sitemiz, oturumunuzu güvenli şekilde sürdürmek ve tercihlerinizi (ör. dil seçimi) hatırlamak için zorunlu çerezler kullanır. Zorunlu çerezler dışında, analiz veya reklam amaçlı üçüncü taraf çerezleri kullanılmamaktadır.",
          ],
        },
        {
          heading: "İletişim",
          body: [
            "Gizlilik Politikası ile ilgili sorularınız için pazarlama@marssoft.com.tr adresinden bizimle iletişime geçebilirsiniz.",
          ],
        },
      ]}
    />
  );
}
