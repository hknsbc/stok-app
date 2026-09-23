-- ============================================================================
-- STOK PANELİ — KALAN EKSİKLER
-- ============================================================================
-- 1) products: kategori, birim, minimum stok eşiği
-- 2) customers: müşteri / tedarikçi / her ikisi ayrımı
-- 3) sales: çok kalemli fiş/fatura için grup kimliği
-- 4) stock_movements: stok hareket geçmişi (audit log)
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- current_tenant_id() fonksiyonu 20260805_rls_lockdown.sql ile zaten var.
-- ============================================================================

-- 1) Ürün: kategori, birim, minimum stok eşiği
alter table public.products add column if not exists category text;
alter table public.products add column if not exists unit text not null default 'adet';
alter table public.products add column if not exists min_stock integer not null default 5;

-- 2) Cari: müşteri / tedarikçi / her ikisi
alter table public.customers add column if not exists type text not null default 'musteri';
alter table public.customers drop constraint if exists customers_type_check;
alter table public.customers add constraint customers_type_check
  check (type in ('musteri', 'tedarikci', 'her_ikisi'));

-- 3) Satış: çok kalemli fiş için grup kimliği
alter table public.sales add column if not exists sale_group_id uuid not null default gen_random_uuid();

-- 4) Stok hareket geçmişi
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  change_type text not null,
  quantity_delta integer not null,
  previous_quantity integer,
  new_quantity integer,
  reference_type text,
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_tenant_idx on public.stock_movements (tenant_id, created_at);
create index if not exists stock_movements_product_idx on public.stock_movements (product_id, created_at);

alter table public.stock_movements enable row level security;

drop policy if exists "stock_movements_tenant_all" on public.stock_movements;
create policy "stock_movements_tenant_all" on public.stock_movements
  for all using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());
