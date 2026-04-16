// Demo kullanıcılar
export const USERS = [
  { id: 1, username: 'hakans', password: '552834', role: 'admin', displayName: 'Hakan S.' },
  { id: 2, username: 'demo', password: 'demo123', role: 'user', displayName: 'Demo Kullanıcı' },
];

// Demo cari listesi
export const INITIAL_CARI = [
  { id: 1, ad: 'ABC Ticaret Ltd.', tip: 'Müşteri', telefon: '0212 555 1234', email: 'abc@ticaret.com', bakiye: 12500, durum: 'Aktif' },
  { id: 2, ad: 'XYZ Tedarik A.Ş.', tip: 'Tedarikçi', telefon: '0216 444 5678', email: 'xyz@tedarik.com', bakiye: -3200, durum: 'Aktif' },
  { id: 3, ad: 'Mehmet Yılmaz', tip: 'Müşteri', telefon: '0532 111 2233', email: 'mehmet@gmail.com', bakiye: 0, durum: 'Aktif' },
  { id: 4, ad: 'Global İthalat', tip: 'Tedarikçi', telefon: '0312 777 8899', email: 'global@ithalat.com', bakiye: -8900, durum: 'Pasif' },
  { id: 5, ad: 'Selin Aksoy', tip: 'Müşteri', telefon: '0544 333 4455', email: 'selin@email.com', bakiye: 5600, durum: 'Aktif' },
];

// Demo stok listesi
export const INITIAL_STOK = [
  { id: 1, kod: 'STK001', ad: 'Laptop Çantası', kategori: 'Aksesuar', miktar: 150, birim: 'Adet', alis: 85, satis: 149, durum: 'Aktif' },
  { id: 2, kod: 'STK002', ad: 'USB-C Kablo 1m', kategori: 'Elektronik', miktar: 320, birim: 'Adet', alis: 25, satis: 49, durum: 'Aktif' },
  { id: 3, kod: 'STK003', ad: 'Kablosuz Mouse', kategori: 'Elektronik', miktar: 45, birim: 'Adet', alis: 120, satis: 199, durum: 'Aktif' },
  { id: 4, kod: 'STK004', ad: 'A4 Kağıt 500lü', kategori: 'Kırtasiye', miktar: 200, birim: 'Paket', alis: 40, satis: 65, durum: 'Aktif' },
  { id: 5, kod: 'STK005', ad: 'Toner HP 85A', kategori: 'Sarf Malzeme', miktar: 8, birim: 'Adet', alis: 380, satis: 550, durum: 'Kritik' },
  { id: 6, kod: 'STK006', ad: 'Ethernet Kablo 5m', kategori: 'Elektronik', miktar: 0, birim: 'Adet', alis: 45, satis: 75, durum: 'Tükendi' },
];

// Demo alışlar
export const INITIAL_ALISLAR = [
  { id: 1, no: 'ALI-2026-001', tarih: '2026-04-10', tedarikci: 'XYZ Tedarik A.Ş.', toplam: 12500, durum: 'Tamamlandı' },
  { id: 2, no: 'ALI-2026-002', tarih: '2026-04-12', tedarikci: 'Global İthalat', toplam: 8900, durum: 'Beklemede' },
  { id: 3, no: 'ALI-2026-003', tarih: '2026-04-14', tedarikci: 'XYZ Tedarik A.Ş.', toplam: 3200, durum: 'Tamamlandı' },
  { id: 4, no: 'ALI-2026-004', tarih: '2026-04-15', tedarikci: 'Global İthalat', toplam: 6750, durum: 'İptal' },
];

// Demo satışlar
export const INITIAL_SATISLAR = [
  { id: 1, no: 'SAT-2026-001', tarih: '2026-04-08', musteri: 'ABC Ticaret Ltd.', toplam: 7450, durum: 'Tamamlandı' },
  { id: 2, no: 'SAT-2026-002', tarih: '2026-04-11', musteri: 'Mehmet Yılmaz', toplam: 1197, durum: 'Tamamlandı' },
  { id: 3, no: 'SAT-2026-003', tarih: '2026-04-13', musteri: 'Selin Aksoy', toplam: 5600, durum: 'Beklemede' },
  { id: 4, no: 'SAT-2026-004', tarih: '2026-04-15', musteri: 'ABC Ticaret Ltd.', toplam: 3200, durum: 'Tamamlandı' },
];
