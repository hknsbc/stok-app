-- ============================================================================
-- RLS LOCKDOWN — stok.marssoft.com.tr / pet / vet / marine ortak Supabase projesi
-- ============================================================================
-- Neden: profiles, tenants, products, stocks, users tabloları anon (herkese
-- açık) anahtarla, hiçbir girişe gerek kalmadan tamamen okunabiliyordu.
-- "users" tablosunda düz metin şifreler bile vardı. Bu script:
--   1) Aktif olarak kullanılan tablolarda (profiles/tenants/products/
--      customers/purchases/sales) RLS açar ve her satırı sahibinin
--      tenant_id'sine kilitler.
--   2) Kodun hiç kullanmadığı eski/demo tabloları (users, stocks, stok,
--      satislar, alislar, cari, sessions, stock_operations) tamamen kilitler.
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- Script tekrar tekrar çalıştırılabilir (idempotent).
-- ============================================================================

-- ── Yardımcı fonksiyon: giriş yapmış kullanıcının tenant_id'si ─────────────
-- security definer: profiles tablosunu RLS'e takılmadan okuyabilsin diye.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- 1) AKTİF TABLOLAR — tenant_id'ye göre izolasyon
-- ============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Kullanıcı kendi kaydını güncelleyebilir ama kendini superadmin yapamaz
-- veya başka bir tenant'a atlayamaz (uygulama zaten bu kolonları hiç
-- güncellemiyor, bu sadece REST API'den doğrudan çağrıya karşı ek kilit).
revoke update (is_superadmin, tenant_id) on public.profiles from authenticated;

-- profiles INSERT/DELETE client'tan yapılmıyor (kayıt tetikleyicisi /
-- servis rolü ile yönetiliyor) — bilerek policy eklenmedi, yani client
-- için varsayılan olarak kapalı kalıyor.

-- ── tenants ──────────────────────────────────────────────────────────────
alter table public.tenants enable row level security;

drop policy if exists "tenants_select_own" on public.tenants;
create policy "tenants_select_own" on public.tenants
  for select using (id = public.current_tenant_id());

drop policy if exists "tenants_update_own" on public.tenants;
create policy "tenants_update_own" on public.tenants
  for update using (id = public.current_tenant_id())
  with check (id = public.current_tenant_id());

-- ── products ─────────────────────────────────────────────────────────────
alter table public.products enable row level security;

drop policy if exists "products_tenant_select" on public.products;
create policy "products_tenant_select" on public.products
  for select using (tenant_id = public.current_tenant_id());

drop policy if exists "products_tenant_insert" on public.products;
create policy "products_tenant_insert" on public.products
  for insert with check (tenant_id = public.current_tenant_id());

drop policy if exists "products_tenant_update" on public.products;
create policy "products_tenant_update" on public.products
  for update using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

drop policy if exists "products_tenant_delete" on public.products;
create policy "products_tenant_delete" on public.products
  for delete using (tenant_id = public.current_tenant_id());

-- ── customers (cari) ─────────────────────────────────────────────────────
alter table public.customers enable row level security;

drop policy if exists "customers_tenant_select" on public.customers;
create policy "customers_tenant_select" on public.customers
  for select using (tenant_id = public.current_tenant_id());

drop policy if exists "customers_tenant_insert" on public.customers;
create policy "customers_tenant_insert" on public.customers
  for insert with check (tenant_id = public.current_tenant_id());

drop policy if exists "customers_tenant_update" on public.customers;
create policy "customers_tenant_update" on public.customers
  for update using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

drop policy if exists "customers_tenant_delete" on public.customers;
create policy "customers_tenant_delete" on public.customers
  for delete using (tenant_id = public.current_tenant_id());

-- ── purchases (alışlar) ──────────────────────────────────────────────────
alter table public.purchases enable row level security;

drop policy if exists "purchases_tenant_select" on public.purchases;
create policy "purchases_tenant_select" on public.purchases
  for select using (tenant_id = public.current_tenant_id());

drop policy if exists "purchases_tenant_insert" on public.purchases;
create policy "purchases_tenant_insert" on public.purchases
  for insert with check (tenant_id = public.current_tenant_id());

drop policy if exists "purchases_tenant_update" on public.purchases;
create policy "purchases_tenant_update" on public.purchases
  for update using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

drop policy if exists "purchases_tenant_delete" on public.purchases;
create policy "purchases_tenant_delete" on public.purchases
  for delete using (tenant_id = public.current_tenant_id());

-- ── sales (satışlar) ─────────────────────────────────────────────────────
alter table public.sales enable row level security;

drop policy if exists "sales_tenant_select" on public.sales;
create policy "sales_tenant_select" on public.sales
  for select using (tenant_id = public.current_tenant_id());

drop policy if exists "sales_tenant_insert" on public.sales;
create policy "sales_tenant_insert" on public.sales
  for insert with check (tenant_id = public.current_tenant_id());

drop policy if exists "sales_tenant_update" on public.sales;
create policy "sales_tenant_update" on public.sales
  for update using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

drop policy if exists "sales_tenant_delete" on public.sales;
create policy "sales_tenant_delete" on public.sales
  for delete using (tenant_id = public.current_tenant_id());

-- ============================================================================
-- 2) ESKİ / KULLANILMAYAN TABLOLAR — tamamen kilitle
-- ============================================================================
-- Bu tablolar mevcut Next.js kodunda hiçbir yerde kullanılmıyor (grep ile
-- doğrulandı). "users" tablosunda düz metin şifreler var — RLS açıp policy
-- eklememek = anon/authenticated için tamamen erişimi kapatır (service_role
-- hâlâ erişebilir, gerekirse veriyi inceleyip sonra DROP TABLE ile
-- kaldırabilirsiniz).

alter table if exists public.users enable row level security;
alter table if exists public.stocks enable row level security;
alter table if exists public.stok enable row level security;
alter table if exists public.satislar enable row level security;
alter table if exists public.alislar enable row level security;
alter table if exists public.cari enable row level security;
alter table if exists public.sessions enable row level security;
alter table if exists public.stock_operations enable row level security;

-- ============================================================================
-- Doğrulama (script çalıştıktan sonra SQL Editor'de ayrıca çalıştırabilirsiniz):
--
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' order by tablename;
--
-- Tüm tablolarda rowsecurity = true olmalı.
-- ============================================================================
