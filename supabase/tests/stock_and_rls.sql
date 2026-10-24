-- ============================================================================
-- STOK RPC + RLS DOĞRULAMA TESTİ  (Supabase SQL Editor'de, STAGING'de çalıştırın)
-- ============================================================================
-- Tüm değişiklikler en sonda ROLLBACK edilir; veri kalmaz.
-- Çalıştırmadan önce aşağıdaki iki UUID'yi gerçek (test) kullanıcı id'leriyle
-- değiştirin:  A = bir tenant'ın kullanıcısı,  B = BAŞKA bir tenant'ın kullanıcısı.
-- Başarısız bir kontrolde "TEST BAŞARISIZ: ..." hatası fırlatılır.
-- ============================================================================
begin;

do $$
declare
  user_a uuid := '00000000-0000-0000-0000-00000000000a';  -- DEĞİŞTİR
  user_b uuid := '00000000-0000-0000-0000-00000000000b';  -- DEĞİŞTİR
  tenant_a uuid;
  tenant_b uuid;
  wh_a uuid;
  wh_a2 uuid;
  prod_a uuid;
  qty integer;
  n integer;
begin
  select tenant_id into tenant_a from profiles where id = user_a;
  select tenant_id into tenant_b from profiles where id = user_b;
  if tenant_a is null or tenant_b is null or tenant_a = tenant_b then
    raise exception 'TEST BAŞARISIZ: user_a ve user_b farklı tenantlara ait gerçek kullanıcılar olmalı';
  end if;

  -- A kullanıcısı gibi davran (RLS devrede)
  perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into warehouses (tenant_id, name) values (tenant_a, 'TEST-1') returning id into wh_a;
  insert into warehouses (tenant_id, name) values (tenant_a, 'TEST-2') returning id into wh_a2;
  insert into products (tenant_id, name, price, selling_price, stock)
    values (tenant_a, 'TEST-URUN', 5, 10, 0) returning id into prod_a;

  -- 1) Alış stoğu artırır
  perform record_purchase(wh_a, prod_a, 10, 5);
  select quantity into qty from product_stock where product_id = prod_a and warehouse_id = wh_a;
  if qty <> 10 then raise exception 'TEST BAŞARISIZ: alış sonrası stok 10 olmalı, %', qty; end if;

  -- 2) Satış stoğu düşürür ve hareket kaydı yazar
  perform record_sale(wh_a, 'nakit',
    json_build_array(json_build_object('product_id', prod_a, 'quantity', 4, 'price', 10, 'cost', 5))::jsonb);
  select quantity into qty from product_stock where product_id = prod_a and warehouse_id = wh_a;
  if qty <> 6 then raise exception 'TEST BAŞARISIZ: satış sonrası stok 6 olmalı, %', qty; end if;
  select count(*) into n from stock_movements where product_id = prod_a;
  if n <> 2 then raise exception 'TEST BAŞARISIZ: 2 stok hareketi beklenirdi, %', n; end if;

  -- 3) Stoktan fazla satış reddedilir ve HİÇBİR şey yazılmaz (atomiklik)
  begin
    perform record_sale(wh_a, 'nakit',
      json_build_array(json_build_object('product_id', prod_a, 'quantity', 7, 'price', 10))::jsonb);
    raise exception 'TEST BAŞARISIZ: yetersiz stokta satış reddedilmedi';
  exception when others then
    if sqlerrm like 'TEST BAŞARISIZ%' then raise; end if;
  end;
  select quantity into qty from product_stock where product_id = prod_a and warehouse_id = wh_a;
  if qty <> 6 then raise exception 'TEST BAŞARISIZ: reddedilen satış stoğu değiştirdi (%)', qty; end if;

  -- 4) Transfer toplamı korur
  perform transfer_stock(prod_a, wh_a, wh_a2, 2);
  select sum(quantity) into qty from product_stock where product_id = prod_a;
  if qty <> 6 then raise exception 'TEST BAŞARISIZ: transfer toplamı değiştirdi (%)', qty; end if;

  -- 5) Geçersiz ödeme yöntemi reddedilir
  begin
    perform record_sale(wh_a, 'bitcoin',
      json_build_array(json_build_object('product_id', prod_a, 'quantity', 1, 'price', 10))::jsonb);
    raise exception 'TEST BAŞARISIZ: geçersiz ödeme yöntemi kabul edildi';
  exception when others then
    if sqlerrm like 'TEST BAŞARISIZ%' then raise; end if;
  end;

  -- 6) Tenant izolasyonu: B kullanıcısı A'nın ürününü göremez / satamaz
  perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  select count(*) into n from products where id = prod_a;
  if n <> 0 then raise exception 'TEST BAŞARISIZ: B kullanıcısı A tenant ürününü görüyor'; end if;
  begin
    perform record_sale(wh_a, 'nakit',
      json_build_array(json_build_object('product_id', prod_a, 'quantity', 1, 'price', 10))::jsonb);
    raise exception 'TEST BAŞARISIZ: B kullanıcısı A ürününü satabildi';
  exception when others then
    if sqlerrm like 'TEST BAŞARISIZ%' then raise; end if;
  end;

  -- 7) Kullanıcı kendi profilini (abonelik dahil) güncelleyemez
  begin
    update profiles set subscription_expires_at = now() + interval '10 years' where id = user_b;
    raise exception 'TEST BAŞARISIZ: kullanıcı kendi aboneliğini güncelleyebildi';
  exception when insufficient_privilege then
    null;
  end;

  raise notice 'TÜM TESTLER GEÇTİ';
end $$;

rollback;
