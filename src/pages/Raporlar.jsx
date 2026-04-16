import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export default function Raporlar({ companyId }) {
  const [data, setData] = useState({ stok:[], alislar:[], satislar:[] });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [{ data: stok }, { data: alislar }, { data: satislar }] = await Promise.all([
      supabase.from('stok').select('*').eq('company_id', companyId),
      supabase.from('alislar').select('*').eq('company_id', companyId),
      supabase.from('satislar').select('*').eq('company_id', companyId),
    ]);
    setData({ stok: stok||[], alislar: alislar||[], satislar: satislar||[] });
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <p style={{textAlign:'center',padding:60,color:'#94a3b8'}}>Raporlar yükleniyor...</p>;

  const { stok, alislar, satislar } = data;
  const toplamSatis = satislar.filter(s=>s.durum==='Tamamlandı').reduce((s,a)=>s+Number(a.toplam),0);
  const toplamAlis = alislar.filter(s=>s.durum==='Tamamlandı').reduce((s,a)=>s+Number(a.toplam),0);
  const karZarar = toplamSatis - toplamAlis;
  const toplamStokDeger = stok.reduce((s,i)=>s+Number(i.miktar)*Number(i.alis_fiyat),0);

  const Row = ({ label, value, color }) => (
    <div style={{display:'flex',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid #f1f5f9'}}>
      <span style={{fontSize:14,color:'#475569'}}>{label}</span>
      <span style={{fontSize:15,fontWeight:700,color:color||'#1e293b'}}>{value}</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Raporlar</h2>
        <button className="btn btn-secondary" onClick={fetch}>Yenile</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <div className="card">
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:'#1e293b'}}>Finansal Özet</h3>
          <Row label="Toplam Satış (Tamamlanan)" value={`₺${toplamSatis.toLocaleString()}`} color="#16a34a"/>
          <Row label="Toplam Alış (Tamamlanan)" value={`₺${toplamAlis.toLocaleString()}`} color="#dc2626"/>
          <Row label="Kâr / Zarar" value={`${karZarar>=0?'+':''}₺${karZarar.toLocaleString()}`} color={karZarar>=0?'#16a34a':'#dc2626'}/>
          <Row label="Stok Toplam Değeri" value={`₺${toplamStokDeger.toLocaleString()}`}/>
        </div>
        <div className="card">
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:'#1e293b'}}>Stok Durumu</h3>
          <Row label="Toplam Ürün Çeşidi" value={stok.length}/>
          <Row label="Aktif Ürünler" value={stok.filter(s=>s.durum==='Aktif').length} color="#16a34a"/>
          <Row label="Kritik Stok" value={stok.filter(s=>s.durum==='Kritik').length} color="#ca8a04"/>
          <Row label="Tükenen Ürünler" value={stok.filter(s=>s.durum==='Tükendi').length} color="#dc2626"/>
        </div>
        <div className="card">
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:'#1e293b'}}>Alış Özeti</h3>
          <Row label="Toplam Fatura" value={alislar.length}/>
          <Row label="Tamamlanan" value={alislar.filter(a=>a.durum==='Tamamlandı').length} color="#16a34a"/>
          <Row label="Bekleyen" value={alislar.filter(a=>a.durum==='Beklemede').length} color="#ca8a04"/>
          <Row label="İptal" value={alislar.filter(a=>a.durum==='İptal').length} color="#dc2626"/>
        </div>
        <div className="card">
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:'#1e293b'}}>Satış Özeti</h3>
          <Row label="Toplam Fatura" value={satislar.length}/>
          <Row label="Tamamlanan" value={satislar.filter(a=>a.durum==='Tamamlandı').length} color="#16a34a"/>
          <Row label="Bekleyen" value={satislar.filter(a=>a.durum==='Beklemede').length} color="#ca8a04"/>
          <Row label="İptal" value={satislar.filter(a=>a.durum==='İptal').length} color="#dc2626"/>
        </div>
      </div>

      <div className="card">
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:'#1e293b'}}>En Yüksek Değerli Ürünler</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ürün Adı</th><th>Miktar</th><th>Alış Fiyatı</th><th>Toplam Değer</th></tr></thead>
            <tbody>
              {[...stok].sort((a,b)=>(b.miktar*b.alis_fiyat)-(a.miktar*a.alis_fiyat)).slice(0,8).map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:600}}>{s.ad}</td>
                  <td>{s.miktar} {s.birim}</td>
                  <td>₺{Number(s.alis_fiyat).toLocaleString()}</td>
                  <td style={{fontWeight:700,color:'#2563eb'}}>₺{(s.miktar*s.alis_fiyat).toLocaleString()}</td>
                </tr>
              ))}
              {stok.length===0&&<tr><td colSpan={4} style={{textAlign:'center',color:'#94a3b8',padding:30}}>Stok kaydı yok</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
