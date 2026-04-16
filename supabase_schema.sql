-- =============================================
-- STOK TAKİP SaaS - Supabase SQL Şeması
-- Supabase Dashboard > SQL Editor'da çalıştırın
-- =============================================

-- KULLANICILAR
create table if not exists users (
  id text primary key,
  username text unique not null,
  email text unique not null,
  password text not null,
  role text not null default 'user',       -- 'admin' | 'user'
  company text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login timestamptz
);

-- Admin kullanıcısını seed et (ilk kurulumda bir kez)
insert into users (id, username, email, password, role, company, is_active)
values ('hakans', 'hakans', 'hakans@stoktakip.com', '552834', 'admin', 'Stok Takip Inc.', true)
on conflict (id) do nothing;

insert into users (id, username, email, password, role, company, is_active)
values ('user1', 'demo', 'demo@example.com', 'demo123', 'user', 'Demo Şirketi A.Ş.', true)
on conflict (id) do nothing;

-- STOK ÜRÜNLERİ
create table if not exists stocks (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  sku text not null,
  quantity integer not null default 0,
  unit text not null default 'adet',
  unit_price numeric not null default 0,
  min_quantity integer not null default 0,
  category text not null default 'Diğer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Demo stok verileri
insert into stocks (id, user_id, name, sku, quantity, unit, unit_price, min_quantity, category)
values
  ('stock1', 'user1', 'Bilgisayar Fare', 'MOUSE-001', 45, 'adet', 125, 20, 'Elektronik'),
  ('stock2', 'user1', 'USB Kablo', 'USB-002', 8, 'adet', 45, 15, 'Elektronik'),
  ('stock3', 'user1', 'Monitör Standı', 'STAND-003', 120, 'adet', 250, 30, 'Aksesuarlar')
on conflict (id) do nothing;

-- STOK OPERASYONLARI
create table if not exists stock_operations (
  id text primary key,
  stock_id text not null,
  user_id text not null references users(id) on delete cascade,
  operation_type text not null,            -- 'add' | 'remove' | 'transfer'
  quantity integer not null default 0,
  previous_quantity integer not null default 0,
  new_quantity integer not null default 0,
  reason text not null default '',
  created_at timestamptz not null default now()
);

-- OTURUMLAR (sessions)
create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Eski oturumları otomatik temizle (7 günden eski)
create or replace function cleanup_old_sessions()
returns void language sql as $$
  delete from sessions where created_at < now() - interval '7 days';
$$;

-- =============================================
-- Row Level Security - KAPALI (server-side auth)
-- Express server kendi session kontrolünü yapıyor
-- =============================================

-- Anon key ile okuma/yazma için politika (server kullanıyor)
alter table users enable row level security;
alter table stocks enable row level security;
alter table stock_operations enable row level security;
alter table sessions enable row level security;

-- Tüm tablolar için anon erişimine izin ver (Express server kontrol eder)
create policy "allow_all_users" on users for all using (true) with check (true);
create policy "allow_all_stocks" on stocks for all using (true) with check (true);
create policy "allow_all_operations" on stock_operations for all using (true) with check (true);
create policy "allow_all_sessions" on sessions for all using (true) with check (true);

-- =============================================
-- İndeksler (performans)
-- =============================================
create index if not exists idx_stocks_user_id on stocks(user_id);
create index if not exists idx_operations_user_id on stock_operations(user_id);
create index if not exists idx_operations_stock_id on stock_operations(stock_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_users_username on users(username);

-- =============================================
-- STOK TAKİP UYGULAMA TABLOLARI (src/pages)
-- Bu tablolar src/pages/*.jsx tarafından
-- doğrudan Supabase client üzerinden kullanılır
-- =============================================

-- CARİ (Müşteri / Tedarikçi yönetimi)
create table if not exists cari (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  ad text not null,
  tip text not null default 'Müşteri',   -- 'Müşteri' | 'Tedarikçi'
  telefon text not null default '',
  email text not null default '',
  bakiye numeric not null default 0,
  durum text not null default 'Aktif',   -- 'Aktif' | 'Pasif'
  created_at timestamptz not null default now()
);

alter table cari enable row level security;
create policy "allow_all_cari" on cari for all using (true) with check (true);
create index if not exists idx_cari_company_id on cari(company_id);

-- STOK (Ürün / Envanter)
create table if not exists stok (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  kod text not null default '',
  ad text not null,
  kategori text not null default 'Genel',
  miktar numeric not null default 0,
  birim text not null default 'Adet',
  alis_fiyat numeric not null default 0,
  satis_fiyat numeric not null default 0,
  durum text not null default 'Aktif',   -- 'Aktif' | 'Pasif'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table stok enable row level security;
create policy "allow_all_stok" on stok for all using (true) with check (true);
create index if not exists idx_stok_company_id on stok(company_id);

-- ALISLAR (Satın alma / Alış faturaları)
create table if not exists alislar (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  no text not null default '',
  tedarikci text not null default '',
  tarih date not null default current_date,
  toplam numeric not null default 0,
  durum text not null default 'Beklemede',  -- 'Beklemede' | 'Tamamlandı' | 'İptal'
  created_at timestamptz not null default now()
);

alter table alislar enable row level security;
create policy "allow_all_alislar" on alislar for all using (true) with check (true);
create index if not exists idx_alislar_company_id on alislar(company_id);

-- SATISLAR (Satış faturaları)
create table if not exists satislar (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  musteri text not null default '',
  tarih date not null default current_date,
  toplam numeric not null default 0,
  durum text not null default 'Beklemede',  -- 'Beklemede' | 'Tamamlandı' | 'İptal'
  created_at timestamptz not null default now()
);

alter table satislar enable row level security;
create policy "allow_all_satislar" on satislar for all using (true) with check (true);
create index if not exists idx_satislar_company_id on satislar(company_id);
