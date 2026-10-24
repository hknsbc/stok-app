-- ============================================================================
-- GOOGLE DRIVE YEDEKLEME / FELAKET KURTARMA
-- ============================================================================
-- backup_connections : tenant başına Google Drive bağlantısı (refresh token
--                      AES-256-GCM ile şifreli; istemciye ASLA dönmez)
-- backup_logs        : her yedek / geri yükleme işi (+ devam eden işin durumu)
-- backup_documents   : Storage dosyalarının Drive'a artımlı yedek kaydı
-- backup_restore_rows / backup_purge_rows / backup_reconcile_stock:
--                      yalnızca service_role çağırabilir (geri yükleme motoru)
--
-- Tüm tablolarda RLS açık ve policy YOK: yalnızca service role (API route)
-- erişir. Tarayıcıdaki anon/authenticated anahtar bu verilere dokunamaz.
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- Script tekrar çalıştırılabilir (idempotent).
-- ============================================================================

create table if not exists public.backup_connections (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  google_email text,
  refresh_token_enc text not null,
  root_folder_id text,
  folder_ids jsonb not null default '{}'::jsonb,
  status text not null default 'connected' check (status in ('connected', 'error')),
  last_error text,
  connected_by uuid,
  connected_at timestamptz not null default now()
);

create table if not exists public.backup_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  operation text not null default 'backup' check (operation in ('backup', 'restore')),
  trigger text not null default 'manual' check (trigger in ('manual', 'cron')),
  status text not null default 'running' check (status in ('running', 'success', 'failed')),
  phase text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  file_name text,
  file_size bigint,
  drive_file_id text,
  record_counts jsonb,
  error_message text,
  warnings jsonb not null default '[]'::jsonb,
  state jsonb not null default '{}'::jsonb,
  lease_until timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists backup_logs_tenant_idx on public.backup_logs (tenant_id, started_at desc);
-- Bir tenant için aynı anda tek çalışan iş (yedek veya geri yükleme)
create unique index if not exists backup_logs_one_running_idx
  on public.backup_logs (tenant_id) where status = 'running';

create table if not exists public.backup_documents (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  bucket text not null,
  path text not null,
  version text not null,
  drive_file_id text not null,
  size bigint,
  backed_up_at timestamptz not null default now(),
  primary key (tenant_id, bucket, path)
);

alter table public.backup_connections enable row level security;
alter table public.backup_logs enable row level security;
alter table public.backup_documents enable row level security;

-- ── Geri yükleme yardımcıları ────────────────────────────────────────────
-- p_rows içindeki satırları (JSON yedeğinden) tabloya yazar.
--  * Yalnızca p_src_tenant'a ait satırlar alınır; tenant_id p_tenant'a çevrilir
--    (Supabase silinip yeni hesap açıldığında farklı tenant'a geri yükleme).
--  * Üretilmiş (generated) kolonlar atlanır, şemada olmayan JSON anahtarları yok sayılır.
--  * Çakışmada yalnızca AYNI tenant'ın satırı güncellenir; başka tenant'ın satırına dokunmaz.
create or replace function public.backup_restore_rows(
  p_src_tenant uuid, p_tenant uuid, p_table text, p_rows jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cols text;
  v_sel text;
  v_set text;
  v_conflict text;
  n integer;
begin
  if p_table not in ('warehouses', 'products', 'customers', 'product_stock',
                     'stock_movements', 'sales', 'purchases') then
    raise exception 'Geçersiz tablo: %', p_table;
  end if;

  select string_agg(quote_ident(a.attname), ', ' order by a.attnum),
         string_agg(case when a.attname = 'tenant_id'
                         then quote_literal(p_tenant::text) || '::uuid'
                         else 'r.' || quote_ident(a.attname) end, ', ' order by a.attnum),
         string_agg(format('%1$I = excluded.%1$I', a.attname), ', ' order by a.attnum)
           filter (where a.attname not in ('id', 'tenant_id'))
    into v_cols, v_sel, v_set
  from pg_attribute a
  where a.attrelid = ('public.' || quote_ident(p_table))::regclass
    and a.attnum > 0 and not a.attisdropped and a.attgenerated = '';

  if p_table = 'product_stock' then
    v_conflict := '(product_id, warehouse_id)';
    v_set := 'quantity = excluded.quantity, updated_at = excluded.updated_at';
  else
    v_conflict := '(id)';
  end if;

  execute format(
    'insert into public.%1$I as t (%2$s) select %3$s from jsonb_populate_recordset(null::public.%1$I, $1) r '
    'where r.tenant_id = $2 on conflict %4$s do update set %5$s where t.tenant_id = excluded.tenant_id',
    p_table, v_cols, v_sel, v_conflict, v_set
  ) using p_rows, p_src_tenant;

  get diagnostics n = row_count;
  return n;
end;
$$;

-- Replace modunda mevcut tenant verisini parça parça siler (timeout olmasın diye limitli).
create or replace function public.backup_purge_rows(p_tenant uuid, p_table text, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if p_table not in ('warehouses', 'products', 'customers', 'product_stock',
                     'stock_movements', 'sales', 'purchases') then
    raise exception 'Geçersiz tablo: %', p_table;
  end if;
  execute format(
    'delete from public.%1$I where ctid in (select ctid from public.%1$I where tenant_id = $1 limit %2$s)',
    p_table, greatest(1, least(p_limit, 20000))
  ) using p_tenant;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Satış/alış trigger'ları geri yükleme sırasında products.stock'u değiştirebilir;
-- yedekteki kesin değerler son adımda yeniden yazılır.
create or replace function public.backup_reconcile_stock(p_tenant uuid, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  update public.products p
     set stock = (r.value->>'stock')::integer
    from jsonb_array_elements(p_rows) r
   where p.id = (r.value->>'id')::uuid
     and p.tenant_id = p_tenant
     and r.value ? 'stock'
     and p.stock is distinct from (r.value->>'stock')::integer;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke execute on function public.backup_restore_rows(uuid, uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.backup_purge_rows(uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.backup_reconcile_stock(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.backup_restore_rows(uuid, uuid, text, jsonb) to service_role;
grant execute on function public.backup_purge_rows(uuid, text, integer) to service_role;
grant execute on function public.backup_reconcile_stock(uuid, jsonb) to service_role;

-- backup_logs'u 2 yıldan eski başarılı kayıtlardan temizle (isteğe bağlı, pg_cron):
--   select cron.schedule('backup-logs-retention', '40 3 * * *',
--     $$ delete from public.backup_logs where started_at < now() - interval '2 years' $$);
