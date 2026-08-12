-- ============================================================================
-- KVKK ONAY ALANLARI — kayıt formundaki pazarlama izni + zorunlu şartlar onayı
-- ============================================================================
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- ============================================================================

alter table public.profiles
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists privacy_terms_accepted_at timestamptz,
  add column if not exists kvkk_accepted_at timestamptz;
