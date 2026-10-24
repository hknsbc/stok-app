-- ============================================================================
-- ATOMİK STOK İŞLEMLERİ — satış / alış / depo transferi / sayım düzeltmesi
-- ============================================================================
-- Neden: Bu işlemler daha önce tarayıcıdan, birbirinden bağımsız çağrılarla
-- yapılıyordu (oku → kontrol et → yaz). İki kasiyer aynı anda satış yapınca
-- stok yanlış hesaplanıyor, yarıda kesilen işlem tutarsız veri bırakıyordu.
-- Artık her işlem tek bir transaction içinde, satır kilidiyle çalışır.
--
-- Fonksiyonlar SECURITY INVOKER: RLS devam eder, tenant izolasyonu bozulmaz.
-- products.stock toplamını mevcut satış/alış trigger'ları yönetmeye devam eder
-- (bu dosya ona dokunmaz).
--
-- Nasıl çalıştırılır: Supabase Dashboard → SQL Editor → yapıştır → Run.
-- ============================================================================

-- Negatif stok artık veritabanı seviyesinde engellenir. NOT VALID: mevcut
-- (varsa) hatalı satırlar yüzünden migration patlamasın; yeni yazmalar kontrol edilir.
alter table public.product_stock drop constraint if exists product_stock_quantity_nonneg;
alter table public.product_stock add constraint product_stock_quantity_nonneg
  check (quantity >= 0) not valid;

-- ── Dahili yardımcı: tek ürün/depo için stok değişimi ────────────────────
create or replace function public.apply_stock_change(
  p_tenant uuid, p_product uuid, p_warehouse uuid, p_delta integer,
  p_change_type text, p_reference text, p_note text default null
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_before integer;
  v_after integer;
begin
  if not exists (select 1 from products where id = p_product and tenant_id = p_tenant) then
    raise exception 'Ürün bulunamadı';
  end if;
  if not exists (select 1 from warehouses where id = p_warehouse and tenant_id = p_tenant) then
    raise exception 'Depo bulunamadı';
  end if;

  select id, quantity into v_id, v_before
  from product_stock
  where product_id = p_product and warehouse_id = p_warehouse
  for update;

  if v_id is null then
    if p_delta < 0 then
      raise exception 'Yetersiz stok (mevcut: 0)';
    end if;
    v_before := 0;
    insert into product_stock (tenant_id, product_id, warehouse_id, quantity)
    values (p_tenant, p_product, p_warehouse, p_delta)
    on conflict (product_id, warehouse_id)
      do update set quantity = product_stock.quantity + excluded.quantity, updated_at = now();
    v_after := p_delta;
  else
    v_after := v_before + p_delta;
    if v_after < 0 then
      raise exception 'Yetersiz stok (mevcut: %)', v_before;
    end if;
    update product_stock set quantity = v_after, updated_at = now() where id = v_id;
  end if;

  insert into stock_movements (
    tenant_id, product_id, warehouse_id, change_type, quantity_delta,
    previous_quantity, new_quantity, reference_type, note, created_by
  ) values (
    p_tenant, p_product, p_warehouse, p_change_type, p_delta,
    v_before, v_after, p_reference, p_note, auth.uid()
  );
end;
$$;

-- ── Çok kalemli satış ────────────────────────────────────────────────────
-- p_items: [{"product_id": "...", "quantity": 2, "price": 10.5, "cost": 8}, ...]
--   price = birim satış fiyatı, cost = birim maliyet.
-- Dönüş: sale_group_id
create or replace function public.record_sale(
  p_warehouse uuid,
  p_payment_method text,
  p_items jsonb,
  p_customer uuid default null,
  p_date date default current_date,
  p_notes text default null,
  p_reference text default 'yeni_satis'
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant uuid := current_tenant_id();
  v_group uuid := gen_random_uuid();
  v_item jsonb;
  v_qty integer;
  v_price numeric;
  v_cost numeric;
begin
  if v_tenant is null then raise exception 'Tenant bulunamadı'; end if;
  if p_payment_method is not null and p_payment_method not in ('nakit', 'banka', 'kredi_kart') then
    raise exception 'Geçersiz ödeme yöntemi';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Satış kalemi yok';
  end if;

  -- Deadlock'u önlemek için kalemleri ürün id sırasıyla işle
  for v_item in
    select value from jsonb_array_elements(p_items) order by value->>'product_id'
  loop
    v_qty := (v_item->>'quantity')::integer;
    v_price := (v_item->>'price')::numeric;
    v_cost := coalesce((v_item->>'cost')::numeric, 0);
    if v_qty is null or v_qty <= 0 then raise exception 'Geçersiz miktar'; end if;
    if v_price is null or v_price < 0 then raise exception 'Geçersiz fiyat'; end if;

    perform apply_stock_change(
      v_tenant, (v_item->>'product_id')::uuid, p_warehouse, -v_qty, 'satis', p_reference
    );

    insert into sales (
      tenant_id, product_id, customer_id, warehouse_id, quantity, price, total, cost,
      date, notes, payment_method, sale_group_id
    ) values (
      v_tenant, (v_item->>'product_id')::uuid, p_customer, p_warehouse, v_qty, v_price,
      v_price * v_qty, v_cost * v_qty, p_date, p_notes, p_payment_method, v_group
    );
  end loop;

  return v_group;
end;
$$;

-- ── Alış ─────────────────────────────────────────────────────────────────
create or replace function public.record_purchase(
  p_warehouse uuid,
  p_product uuid,
  p_quantity integer,
  p_price numeric,
  p_customer uuid default null,
  p_date date default current_date,
  p_notes text default null
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant uuid := current_tenant_id();
  v_id uuid;
begin
  if v_tenant is null then raise exception 'Tenant bulunamadı'; end if;
  if p_quantity is null or p_quantity <= 0 then raise exception 'Geçersiz miktar'; end if;
  if p_price is null or p_price < 0 then raise exception 'Geçersiz fiyat'; end if;

  perform apply_stock_change(v_tenant, p_product, p_warehouse, p_quantity, 'alis', 'alislar');

  insert into purchases (
    tenant_id, product_id, customer_id, warehouse_id, quantity, price, total, date, notes
  ) values (
    v_tenant, p_product, p_customer, p_warehouse, p_quantity, p_price,
    p_price * p_quantity, p_date, p_notes
  ) returning id into v_id;

  return v_id;
end;
$$;

-- ── Depolar arası transfer ───────────────────────────────────────────────
create or replace function public.transfer_stock(
  p_product uuid, p_from uuid, p_to uuid, p_quantity integer
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant uuid := current_tenant_id();
begin
  if v_tenant is null then raise exception 'Tenant bulunamadı'; end if;
  if p_from = p_to then raise exception 'Kaynak ve hedef depo aynı olamaz'; end if;
  if p_quantity is null or p_quantity <= 0 then raise exception 'Geçersiz miktar'; end if;

  perform apply_stock_change(v_tenant, p_product, p_from, -p_quantity, 'transfer_cikis', 'depo_transfer', 'Hedef depo: ' || p_to);
  perform apply_stock_change(v_tenant, p_product, p_to, p_quantity, 'transfer_giris', 'depo_transfer', 'Kaynak depo: ' || p_from);
end;
$$;

-- ── Manuel stok düzeltme (sayım): depodaki miktarı belirli değere ayarla ──
create or replace function public.set_stock_quantity(
  p_product uuid, p_warehouse uuid, p_quantity integer, p_note text default null
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant uuid := current_tenant_id();
  v_current integer;
begin
  if v_tenant is null then raise exception 'Tenant bulunamadı'; end if;
  if p_quantity is null or p_quantity < 0 then raise exception 'Geçersiz miktar'; end if;

  select quantity into v_current from product_stock
  where product_id = p_product and warehouse_id = p_warehouse for update;

  perform apply_stock_change(
    v_tenant, p_product, p_warehouse, p_quantity - coalesce(v_current, 0),
    'duzeltme', 'stok_duzenle', p_note
  );
end;
$$;

revoke execute on function public.apply_stock_change(uuid, uuid, uuid, integer, text, text, text) from public, anon;
revoke execute on function public.record_sale(uuid, text, jsonb, uuid, date, text, text) from public, anon;
revoke execute on function public.record_purchase(uuid, uuid, integer, numeric, uuid, date, text) from public, anon;
revoke execute on function public.transfer_stock(uuid, uuid, uuid, integer) from public, anon;
revoke execute on function public.set_stock_quantity(uuid, uuid, integer, text) from public, anon;
grant execute on function public.apply_stock_change(uuid, uuid, uuid, integer, text, text, text) to authenticated;
grant execute on function public.record_sale(uuid, text, jsonb, uuid, date, text, text) to authenticated;
grant execute on function public.record_purchase(uuid, uuid, integer, numeric, uuid, date, text) to authenticated;
grant execute on function public.transfer_stock(uuid, uuid, uuid, integer) to authenticated;
grant execute on function public.set_stock_quantity(uuid, uuid, integer, text) to authenticated;
