import LegalPage from "@/components/legal/LegalPage";

export const metadata = { title: "Kullanım Şartları" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Kullanım Şartları"
      lastUpdated="12 Ağustos 2026"
      intro={'Bu Kullanım Şartları, Marssoft tarafından işletilen stok, petshop, veteriner ve marina yönetim yazılımlarının (stok.marssoft.com.tr, pet.marssoft.com.tr, vet.marssoft.com.tr, marine.marssoft.com.tr — birlikte "Hizmet") kullanımına ilişkin koşulları düzenler. Hizmete kayıt olarak bu şartları kabul etmiş sayılırsınız.'}
      sections={[
        {
          heading: "Taraflar ve Kapsam",
          body: [
            "Bu şartlar, Hizmeti sağlayan Marssoft (\"Hizmet Sağlayıcı\") ile Hizmete kayıt olan gerçek veya tüzel kişi (\"Kullanıcı\") arasındaki ilişkiyi düzenler.",
          ],
        },
        {
          heading: "Hizmetin Tanımı",
          body: [
            "Hizmet, işletmenizin stok, cari, satış/alış, raporlama ve kullandığınız panele özgü ek modüllerini (ör. pet kartı, hasta kartı, tekne kartı) bulut üzerinden yönetmenizi sağlayan bir yazılım-hizmet (SaaS) ürünüdür. Hizmet Sağlayıcı, Hizmetin içeriğini ve kapsamını geliştirmek amacıyla değiştirme hakkını saklı tutar.",
          ],
        },
        {
          heading: "Hesap ve Kayıt Kuralları",
          body: [
            "Kayıt sırasında verdiğiniz bilgilerin doğru ve güncel olmasından siz sorumlusunuz. Hesap bilgilerinizin (kullanıcı adı/şifre) gizliliğinden ve hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz. Bazı planlarda hesabınızın kullanıma açılması Hizmet Sağlayıcı onayına tabidir.",
          ],
        },
        {
          heading: "Abonelik ve Ödeme",
          body: [
            "Seçtiğiniz plana göre Hizmet ücretli veya belirli bir deneme süresi için ücretsiz olabilir. Ücretli planlarda fatura dönemi ve fiyatlandırma, kayıt sırasında veya abonelik sayfasında belirtildiği şekildedir. Ödemeler önceden belirtilmedikçe iade edilmez; abonelik iptali, bir sonraki fatura döneminden önce yapılmalıdır.",
          ],
        },
        {
          heading: "Kullanıcı Sorumlulukları",
          body: [
            "Hizmeti kullanırken yürürlükteki mevzuata uygun davranmayı, Hizmeti kötüye kullanmamayı (ör. yetkisiz erişim, veri kazıma, hizmeti aşırı yükleme) ve sisteme girdiğiniz verilerin (ör. müşteri/hasta bilgileri) hukuka uygunluğundan bizzat sorumlu olduğunuzu kabul edersiniz.",
          ],
        },
        {
          heading: "Hizmet Sağlayıcının Hakları",
          body: [
            "Hizmet Sağlayıcı; kullanım şartlarının ihlali, ödeme yükümlülüklerinin yerine getirilmemesi veya hukuka aykırı kullanım tespiti halinde hesabınızı askıya alma veya sonlandırma hakkını saklı tutar. Hizmet Sağlayıcı, planlı bakım veya teknik zorunluluklar nedeniyle Hizmete erişimi geçici olarak kısıtlayabilir.",
          ],
        },
        {
          heading: "Sorumluluk Sınırlaması",
          body: [
            "Hizmet \"olduğu gibi\" sunulur. Hizmet Sağlayıcı, kesintisiz veya hatasız çalışmayı garanti etmez. Yürürlükteki mevzuatın izin verdiği azami ölçüde, Hizmet Sağlayıcı dolaylı zararlardan (kâr kaybı, veri kaybı vb.) sorumlu tutulamaz. Kullanıcı, işletmesine ait kritik verilerin düzenli olarak yedeklenmesinden kendisi sorumludur.",
          ],
        },
        {
          heading: "Değişiklikler",
          body: [
            "Bu Kullanım Şartları zaman zaman güncellenebilir. Önemli değişiklikler, Hizmet üzerinden veya kayıtlı e-posta adresinize bildirim yoluyla duyurulur. Güncel şartlar bu sayfada yayımlanan tarih itibarıyla yürürlüktedir.",
          ],
        },
        {
          heading: "İletişim",
          body: [
            "Kullanım Şartları ile ilgili sorularınız için pazarlama@marssoft.com.tr adresinden bizimle iletişime geçebilirsiniz.",
          ],
        },
      ]}
    />
  );
}
