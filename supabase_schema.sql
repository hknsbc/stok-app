-- =============================================
-- STOK TAKİP SaaS - Veritabanı Şeması
-- Supabase SQL Editor'da çalıştırın
-- =============================================

-- 1. ŞİRKETLER (Tenants)
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'baslangic', -- baslangic | pro | kurumsal
  plan_expires_at timestamptz default (now() + interval '30 days'),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. PROFİLLER (auth.users uzantısı)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  full_name text,
  role text not null default 'owner', -- superadmin | owner | user
  created_at timestamptz default now()
);

-- 3. CARİ
create table if not exists cari (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  ad text not null,
  tip text default 'Müşteri',
  telefon text default '',
  email text default '',
  bakiye numeric default 0,
  durum text default 'Aktif',
  created_at timestamptz default now()
);

-- 4. STOK
create table if not exists stok (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  kod text default '',
  ad text not null,
  kategori text default '',
  miktar numeric default 0,
  birim text default 'Adet',
  alis_fiyat numeric default 0,
  satis_fiyat numeric default 0,
  durum text default 'Aktif',
  created_at timestamptz default now()
);

-- 5. ALIŞLAR
create table if not exists alislar (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  no text,
  tedarikci text,
  tarih date default current_date,
  toplam numeric default 0,
  durum text default 'Beklemede',
  created_at timestamptz default now()
);

-- 6. SATIŞLAR
create table if not exists satislar (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  no text,
  musteri text,
  tarih date default current_date,
  toplam numeric default 0,
  durum text default 'Beklemede',
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (Çok Kiracılı Yapı)
-- =============================================

alter table companies enable row level security;
alter table profiles enable row level security;
alter table cari enable row level security;
alter table stok enable row level security;
alter table alislar enable row level security;
alter table satislar enable row level security;

-- Kullanıcının company_id'sini döndüren fonksiyon
create or replace function get_my_company_id()
returns uuid language sql stable security definer as $$
  select company_id from profiles where id = auth.uid()
$$;

-- Kullanıcının rolünü döndüren fonksiyon
create or replace function get_my_role()
returns text language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- COMPANIES policies
create policy "superadmin_all_companies" on companies
  for all using (get_my_role() = 'superadmin');

create policy "owner_own_company" on companies
  for select using (id = get_my_company_id());

create policy "owner_update_own_company" on companies
  for update using (id = get_my_company_id());

-- PROFILES policies
create policy "superadmin_all_profiles" on profiles
  for all using (get_my_role() = 'superadmin');

create policy "user_own_profile" on profiles
  for select using (id = auth.uid());

create policy "update_own_profile" on profiles
  for update using (id = auth.uid());

create policy "insert_own_profile" on profiles
  for insert with check (id = auth.uid());

create policy "owner_see_company_profiles" on profiles
  for select using (company_id = get_my_company_id());

-- CARİ policies
create policy "company_cari" on cari
  for all using (
    company_id = get_my_company_id() or get_my_role() = 'superadmin'
  );

-- STOK policies
create policy "company_stok" on stok
  for all using (
    company_id = get_my_company_id() or get_my_role() = 'superadmin'
  );

-- ALIŞLAR policies
create policy "company_alislar" on alislar
  for all using (
    company_id = get_my_company_id() or get_my_role() = 'superadmin'
  );

-- SATIŞLAR policies
create policy "company_satislar" on satislar
  for all using (
    company_id = get_my_company_id() or get_my_role() = 'superadmin'
  );

-- =============================================
-- KAYIT TETİKLEYİCİSİ
-- Yeni kullanıcı kaydında profile otomatik oluştur
-- =============================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, company_id, full_name, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'company_id')::uuid,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'owner')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
