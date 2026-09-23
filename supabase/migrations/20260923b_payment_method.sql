-- ============================================================================
-- ÖDEME YÖNTEMİ — Kasa (Nakit / Banka / Kredi Kartı) raporu için
-- ============================================================================
-- Şimdiye kadar ödeme yöntemi sadece sales.notes içine serbest metin olarak
-- yazılıyordu ("Payment: Nakit" gibi) — raporlamak için güvenilir değil.
-- Artık ayrı, yapılandırılmış bir kolon var.
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- ============================================================================

alter table public.sales add column if not exists payment_method text;
