-- ============================================================================
-- DEPO (WAREHOUSE) YÖNETİMİ — Stok paneli
-- ============================================================================
-- warehouses: tenant başına depo listesi (biri is_default=true olmalı)
-- product_stock: ürün × depo bazında miktar. products.stock TOPLAM olarak
--   kalmaya devam ediyor (satış/alış trigger'ları onu yönetiyor, dokunulmadı);
--   product_stock ayrı, ek bir katman — senkronizasyonu uygulama kodu yapıyor.
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- current_tenant_id() fonksiyonu 20260805_rls_lockdown.sql ile zaten var.
-- ============================================================================

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_stock (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (product_id, warehouse_id)
);

create index if not exists product_stock_product_idx on public.product_stock (product_id);
create index if not exists product_stock_warehouse_idx on public.product_stock (warehouse_id);

alter table public.sales add column if not exists warehouse_id uuid references public.warehouses(id);
alter table public.purchases add column if not exists warehouse_id uuid references public.warehouses(id);

-- Mevcut her tenant için bir "Merkez Depo" oluştur (zaten varsa tekrar eklemez)
insert into public.warehouses (tenant_id, name, is_default)
select t.id, 'Merkez Depo', true
from public.tenants t
where not exists (
  select 1 from public.warehouses w where w.tenant_id = t.id
);

-- Mevcut products.stock değerlerini Merkez Depo'ya yaz (ilk kurulum, tek seferlik)
insert into public.product_stock (tenant_id, product_id, warehouse_id, quantity)
select p.tenant_id, p.id, w.id, coalesce(p.stock, 0)
from public.products p
join public.warehouses w on w.tenant_id = p.tenant_id and w.is_default = true
on conflict (product_id, warehouse_id) do nothing;

alter table public.warehouses enable row level security;
alter table public.product_stock enable row level security;

drop policy if exists "warehouses_tenant_all" on public.warehouses;
create policy "warehouses_tenant_all" on public.warehouses
  for all using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

drop policy if exists "product_stock_tenant_all" on public.product_stock;
create policy "product_stock_tenant_all" on public.product_stock
  for all using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());
