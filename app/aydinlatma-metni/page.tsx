import LegalPage from "@/components/legal/LegalPage";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function AydinlatmaMetniPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      lastUpdated="12 Ağustos 2026"
      intro={"İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (\"KVKK\") 10. maddesi uyarınca, kişisel verilerinizin işlenmesine ilişkin olarak veri sorumlusu sıfatıyla tarafımızca aydınlatma yükümlülüğünün yerine getirilmesi amacıyla hazırlanmıştır."}
      sections={[
        {
          heading: "Veri Sorumlusunun Kimliği",
          body: [
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
          heading: "İşlenen Kişisel Veri Kategorileri",
          body: [
            {
              list: [
                "Kimlik bilgileri: ad soyad",
                "İletişim bilgileri: e-posta, telefon",
                "Müşteri işlem bilgileri: firma adı, abonelik/plan bilgisi, fatura ve ödeme bilgileri",
                "İşlem güvenliği bilgileri: kullanıcı adı, şifrelenmiş şifre, oturum/giriş kayıtları",
                "Kullanım verileri: uygulama içinde ziyaret edilen sayfalar, oturum süresi",
                "İşlem verileri: kullandığınız panele göre girilen operasyonel kayıtlar (stok, cari, satış/alış ve modüle özgü kayıtlar); bu kayıtlar sizin kendi müşterilerinize/hastalarınıza ait kişisel veri içerebilir ve bu veriler bakımından siz kendi veri sorumluluğunuzu taşırsınız",
              ],
            },
          ],
        },
        {
          heading: "Kişisel Verilerin İşlenme Amaçları",
          body: [
            {
              list: [
                "Hizmetin sunulması, hesabınızın oluşturulması ve yönetilmesi",
                "Abonelik ve faturalandırma süreçlerinin yürütülmesi",
                "Müşteri destek taleplerinin karşılanması",
                "Hizmet güvenliğinin sağlanması ve kötüye kullanımın önlenmesi",
                "Yasal yükümlülüklerin yerine getirilmesi",
                "Onay vermeniz halinde ticari elektronik ileti gönderilmesi",
              ],
            },
          ],
        },
        {
          heading: "Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi",
          body: [
            "Kişisel verileriniz, kayıt formu, iletişim formları ve Hizmetin kullanımı sırasında elektronik ortamda doğrudan sizden toplanır. Veriler; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (KVKK m.5/2-c), hukuki yükümlülüğün yerine getirilmesi (m.5/2-ç), veri sorumlusunun meşru menfaati (m.5/2-f) hukuki sebeplerine dayanılarak işlenir; ticari elektronik ileti gönderimi ise açık rızanıza (m.5/1) dayanılarak gerçekleştirilir.",
          ],
        },
        {
          heading: "Kişisel Verilerin Aktarılması",
          body: [
            "Kişisel verileriniz; hizmetin sunulabilmesi için gerekli ölçüde, barındırma/veritabanı ve altyapı hizmeti sağlayan iş ortaklarımızla (bu sağlayıcıların sunucuları yurt dışında konumlanmış olabilir) ve yasal olarak yetkili kamu kurum ve kuruluşlarıyla, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde paylaşılabilir. Yurt dışına aktarım söz konusu olduğunda, KVKK'nın öngördüğü uygun güvenceler sağlanır.",
          ],
        },
        {
          heading: "KVKK Madde 11 Kapsamındaki Haklarınız",
          body: [
            "KVKK'nın 11. maddesi uyarınca; kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, KVKK'da öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme, düzeltme/silme/yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme, işlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
          ],
        },
        {
          heading: "Başvuru Yöntemi",
          body: [
            "Yukarıda sayılan haklarınıza ilişkin taleplerinizi, kimliğinizi tevsik edici belgelerle birlikte pazarlama@marssoft.com.tr e-posta adresine veya veri sorumlusunun yukarıda belirtilen adresine yazılı olarak iletebilirsiniz. Talebiniz, niteliğine göre en kısa sürede ve en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.",
          ],
        },
      ]}
    />
  );
}
