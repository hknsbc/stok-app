-- ============================================================================
-- ABONELİK ZORLAMASI + PROFİL KOLON KİLİDİ
-- ============================================================================
-- Sorun 1: profiles_update_own policy'si kullanıcıya KENDİ satırını güncelleme
--   izni veriyordu; yalnızca is_superadmin/tenant_id kilitliydi. Yani bir
--   kullanıcı REST API'den kendi is_active / subscription_expires_at / plan
--   değerini değiştirip aboneliğini kendi uzatabiliyordu.
-- Sorun 2: Abonelik/aktiflik kontrolü yalnızca login ekranındaydı. Geçerli
--   oturumu olan pasif/süresi dolmuş hesap veriye API'den erişmeye devam ediyordu.
--
-- Çözüm:
--   1) Client (authenticated) rolü profiles üzerinde hiçbir kolonu güncelleyemez.
--      Uygulama zaten profiles'ı yalnızca service role ile (API route) yazıyor.
--   2) Restrictive policy'ler: pasif hesap hiçbir şey okuyamaz/yazamaz;
--      aboneliği bitmiş hesap salt-okunur olur (veri kaybı yok, yazma yok).
--      Restrictive policy, mevcut tenant policy'lerine EK koşul olarak uygulanır.
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- Script tekrar çalıştırılabilir (idempotent). Tablo yoksa atlanır.
-- ============================================================================

-- 1) profiles: istemci tarafı güncelleme tamamen kapalı
drop policy if exists "profiles_update_own" on public.profiles;
revoke update on public.profiles from authenticated, anon;

-- 2) Hesap durumu yardımcıları
-- Okuma: is_active = false ise kapalı. Superadmin her zaman geçer.
create or replace function public.account_can_read()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_superadmin or is_active is distinct from false
     from public.profiles where id = auth.uid()),
    false
  )
$$;

-- Yazma: aktif olmalı VE abonelik süresi dolmamış olmalı (süre boşsa geçerli).
create or replace function public.account_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_superadmin
            or (is_active is distinct from false
                and (subscription_expires_at is null or subscription_expires_at > now()))
     from public.profiles where id = auth.uid()),
    false
  )
$$;

revoke execute on function public.account_can_read() from public, anon;
revoke execute on function public.account_can_write() from public, anon;
grant execute on function public.account_can_read() to authenticated;
grant execute on function public.account_can_write() to authenticated;

-- 3) Restrictive policy'leri veri tablolarına uygula
do $$
declare
  t text;
  tables text[] := array[
    -- stok
    'products', 'customers', 'purchases', 'sales',
    'warehouses', 'product_stock', 'stock_movements',
    -- pet / vet / marine (tablo varsa)
    'pet_cards', 'vet_patients', 'vet_examinations', 'vet_vaccines',
    'vet_invoices', 'vet_message_log', 'boat_cards', 'maintenance_records'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is null then
      raise notice 'Atlandı (tablo yok): %', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_account_read', t);
    execute format(
      'create policy %I on public.%I as restrictive for select using (public.account_can_read())',
      t || '_account_read', t);

    execute format('drop policy if exists %I on public.%I', t || '_account_write_ins', t);
    execute format(
      'create policy %I on public.%I as restrictive for insert with check (public.account_can_write())',
      t || '_account_write_ins', t);

    execute format('drop policy if exists %I on public.%I', t || '_account_write_upd', t);
    execute format(
      'create policy %I on public.%I as restrictive for update using (public.account_can_write()) with check (public.account_can_write())',
      t || '_account_write_upd', t);

    execute format('drop policy if exists %I on public.%I', t || '_account_write_del', t);
    execute format(
      'create policy %I on public.%I as restrictive for delete using (public.account_can_write())',
      t || '_account_write_del', t);
  end loop;
end $$;

-- 4) Pet / vet / marine tablolarında tenant izolasyonu (tablo + tenant_id kolonu
--    varsa ve henüz hiç policy yoksa). Zaten policy tanımlıysa dokunulmaz.
do $$
declare
  t text;
  tables text[] := array[
    'pet_cards', 'vet_patients', 'vet_examinations', 'vet_vaccines',
    'vet_invoices', 'vet_message_log', 'boat_cards', 'maintenance_records'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is null then continue; end if;
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'tenant_id'
    ) then
      raise notice 'tenant_id kolonu yok, elle incelenmeli: %', t;
      continue;
    end if;
    -- Kendi _account_* restrictive policy'lerimiz dışında permissive policy var mı?
    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t and permissive = 'PERMISSIVE'
    ) then
      continue;
    end if;
    execute format('drop policy if exists %I on public.%I', t || '_tenant_all', t);
    execute format(
      'create policy %I on public.%I for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id())',
      t || '_tenant_all', t);
  end loop;
end $$;

-- 5) Eski / kullanılmayan tablolar — RLS açık kalsın (policy yok = kapalı).
--    "users" tablosunda düz metin şifre vardı. Veriyi inceleyip elle silin:
--      drop table public.users;
--    (Otomatik silinmez: geri dönüşü yok.)

-- Doğrulama (SQL Editor'de ayrıca çalıştırın) — hepsi true olmalı:
--   select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;
--   select tablename, policyname, permissive, cmd from pg_policies where schemaname='public' order by 1,2;
