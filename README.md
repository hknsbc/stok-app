# Stok / Pet / Vet / Marine (marssoft)

Next.js (App Router) + Supabase çok kiracılı (multi-tenant) stok ve işletme yönetimi uygulaması.
Aynı kod tabanı alan adına göre dört moda ayrılır (`proxy.ts`): `stok`, `pet`, `vet`, `marine`.

> Bu proje standart Next.js'ten farklı sürüm kullanır (`proxy.ts`, değişen API'ler).
> Kod yazmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehbere bakın (bkz. `AGENTS.md`).

## Kurulum

```bash
npm ci
cp .env.example .env.local   # değerleri doldurun
npm run dev
```

Gerekli ortam değişkenleri:

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) anahtar — RLS ile korunur |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sadece sunucu.** API route'larında kullanılır, asla istemciye sızdırmayın |

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (tip hataları build'i durdurur) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest birim testleri (`tests/`) |

CI (`.github/workflows/ci.yml`) her push/PR'da typecheck, lint, test ve build çalıştırır.

## Veritabanı

Migration'lar `supabase/migrations/` altındadır ve **tarih sırasıyla** Supabase SQL Editor'de çalıştırılır.
Hepsi tekrar çalıştırılabilir (idempotent) yazılmıştır.

> ⚠️ Temel tablolar (`profiles`, `tenants`, `products`, `sales`, `purchases`, `customers`) ve bunların
> trigger'ları (profil oluşturma, `products.stock` toplamı) migration olarak repoda **yoktur**.
> Mevcut canlı şemayı çıkarıp ekleyin: `supabase db dump --schema public -f supabase/migrations/00000000_baseline.sql`

Önemli mimari kararlar:

- **Tenant izolasyonu:** her tabloda `tenant_id` + RLS (`current_tenant_id()`).
- **Hesap durumu:** `account_can_read()` / `account_can_write()` restrictive policy'leri — pasif hesap hiçbir
  şey okuyamaz/yazamaz; aboneliği biten hesap salt-okunur olur (`20261023b_subscription_enforcement.sql`).
- **Profil yazımı:** istemci `profiles` tablosunu güncelleyemez; yalnızca API route'ları (service role) yazar.
- **Stok işlemleri atomiktir:** satış, alış, transfer ve sayım düzeltmesi Postgres RPC'leri ile yapılır
  (`record_sale`, `record_purchase`, `transfer_stock`, `set_stock_quantity`). İstemciden `product_stock`'a
  doğrudan yazmayın.
- **1000 satır sınırı:** PostgREST tek istekte 1000 satırdan fazlasını kesin. Tüm satırlar gerekiyorsa
  `lib/fetch-all.ts` içindeki `fetchAllRows` kullanın (sorguya `.order(...)` ekleyin).

Veritabanı doğrulama testi: `supabase/tests/stock_and_rls.sql` (staging'de çalıştırın, sonunda rollback eder).

## Güvenlik notları

- Kayıt endpoint'i (`/api/auth/register`) IP başına saatte 5 deneme ile sınırlıdır. Bu sınır bellek içidir
  (her sunucusuz instance ayrı sayar); kalıcı/global sınır için Upstash/Vercel KV önerilir.
- Güvenlik başlıkları `next.config.ts` içinde tanımlıdır. CSP henüz eklenmedi (inline stiller yaygın).
- Eski `users` tablosunda düz metin şifre bulunmuştu; veriyi inceleyip tabloyu silin (`DROP TABLE public.users`).
