-- ============================================================================
-- INDEKSLER + KULLANIM VERİSİ SAKLAMA SÜRESİ + VERİ BÜTÜNLÜĞÜ KISITLARI
-- ============================================================================
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- Idempotent. Tablo/kolon yoksa ilgili satır hata verir; verirse o satırı atlayıp devam edin.
-- ============================================================================

-- Sık kullanılan sorgular için bileşik indeksler (RLS her sorguda tenant_id filtreler)
create index if not exists sales_tenant_date_idx on public.sales (tenant_id, date desc);
create index if not exists sales_tenant_group_idx on public.sales (tenant_id, sale_group_id);
create index if not exists purchases_tenant_date_idx on public.purchases (tenant_id, date desc);
create index if not exists products_tenant_idx on public.products (tenant_id);
create index if not exists products_tenant_barcode_idx on public.products (tenant_id, barcode);
create index if not exists customers_tenant_idx on public.customers (tenant_id);
create index if not exists profiles_tenant_idx on public.profiles (tenant_id);

-- Para/miktar alanları: negatif değer girilemesin (mevcut veriyi doğrulamadan: NOT VALID)
alter table public.sales drop constraint if exists sales_quantity_pos;
alter table public.sales add constraint sales_quantity_pos check (quantity > 0) not valid;
alter table public.sales drop constraint if exists sales_amounts_nonneg;
alter table public.sales add constraint sales_amounts_nonneg check (price >= 0 and total >= 0) not valid;
alter table public.purchases drop constraint if exists purchases_quantity_pos;
alter table public.purchases add constraint purchases_quantity_pos check (quantity > 0) not valid;

-- Ödeme yöntemi serbest metin olmasın
alter table public.sales drop constraint if exists sales_payment_method_check;
alter table public.sales add constraint sales_payment_method_check
  check (payment_method is null or payment_method in ('nakit', 'banka', 'kredi_kart')) not valid;

-- usage_events: 90 günden eskisini sil. Günlük çalıştırmak için pg_cron:
--   select cron.schedule('usage-events-retention', '30 3 * * *', $$ select public.purge_old_usage_events() $$);
create or replace function public.purge_old_usage_events()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare n bigint;
begin
  delete from public.usage_events where created_at < now() - interval '90 days';
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke execute on function public.purge_old_usage_events() from public, anon, authenticated;
