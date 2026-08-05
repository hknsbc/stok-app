-- ============================================================================
-- USAGE TRACKING — Stok paneli müşteri kullanım/demo takibi
-- ============================================================================
-- profiles.phone: kayıt formunda toplanan telefon numarası
-- usage_events: hangi sayfaları ziyaret etti (pageview) + ne kadar aktif
--   kaldı (heartbeat, ~60sn aralıklarla) — admin panelindeki "kullanılan
--   özellikler / süre / demo puanı / durum" kolonları buradan hesaplanır.
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- current_tenant_id() fonksiyonu 20260805_rls_lockdown.sql ile zaten
-- oluşturuldu, burada tekrar tanımlanmıyor.
-- ============================================================================

alter table public.profiles add column if not exists phone text;

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  event_type text not null check (event_type in ('pageview', 'heartbeat')),
  path text,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_tenant_idx on public.usage_events (tenant_id, created_at);
create index if not exists usage_events_user_idx on public.usage_events (user_id, created_at);

alter table public.usage_events enable row level security;

drop policy if exists "usage_events_insert_own_tenant" on public.usage_events;
create policy "usage_events_insert_own_tenant" on public.usage_events
  for insert with check (tenant_id = public.current_tenant_id());

drop policy if exists "usage_events_select_own_tenant" on public.usage_events;
create policy "usage_events_select_own_tenant" on public.usage_events
  for select using (tenant_id = public.current_tenant_id());
