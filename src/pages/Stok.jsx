import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';

const planLimits = { baslangic: 1000, pro: 10000, kurumsal: Infinity };
const empty = { kod:'', ad:'', kategori:'', miktar:0, birim:'Adet', alis_fiyat:0, satis_fiyat:0 };

const durumBadge = (d) => d==='Aktif'?'badge-green':d==='Kritik'?'badge-yellow':'badge-red';

export default function Stok({ companyId, plan }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('stok').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = list.filter(s =>
    s.ad.toLowerCase().includes(q.toLowerCase()) || s.kod.toLowerCase().includes(q.toLowerCase()) || s.kategori.toLowerCase().includes(q.toLowerCase())
  );

  const save = async () => {
    if (!form.ad.trim()) return;
    setSaving(true);
    const miktar = Number(form.miktar);
    const durum = miktar === 0 ? 'Tükendi' : miktar < 10 ? 'Kritik' : 'Aktif';
    const payload = { ...form, miktar, alis_fiyat: Number(form.alis_fiyat), satis_fiyat: Number(form.satis_fiyat), durum, company_id: companyId };
    if (modal.mode === 'add') {
      await supabase.from('stok').insert(payload);
    } else {
      await supabase.from('stok').update(payload).eq('id', modal.id);
    }
    await fetch();
    setModal(null);
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return;
    await supabase.from('stok').delete().eq('id', id);
    setList(p => p.filter(s => s.id !== id));
  };

  const limit = planLimits[plan] || 1000;
  const kritik = list.filter(s => s.durum === 'Kritik' || s.durum === 'Tükendi');

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Stok Yönetimi <span style={{fontSize:14,fontWeight:400,color:'#94a3b8'}}>({list.length}/{limit === Infinity ? '∞' : limit})</span></h2>
        <div style={{display:'flex',gap:10}}>
          <div className="search-wrap"><Search size={15}/><input className="search-input" placeholder="Ürün ara..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-secondary" onClick={fetch}><RefreshCw size={15}/></button>
          <button className="btn btn-primary" onClick={()=>{
            if (list.length >= limit) { alert(`${plan} planında maksimum ${limit} ürün eklenebilir.`); return; }
            setForm(empty); setModal({mode:'add'});
          }}><Plus size={16}/> Yeni Ürün</button>
        </div>
      </div>

      {kritik.length > 0 && (
        <div style={{background:'#fef9c3',border:'1px solid #fde047',borderRadius:10,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <AlertTriangle size={18} color="#ca8a04"/>
          <span style={{fontSize:14,color:'#92400e'}}><b>{kritik.length}</b> ürün kritik stok seviyesinde veya tükenmiş!</span>
        </div>
      )}

      <div className="card">
        {loading ? <p style={{textAlign:'center',padding:40,color:'#94a3b8'}}>Yükleniyor...</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kod</th><th>Ürün Adı</th><th>Kategori</th><th>Miktar</th><th>Birim</th><th>Alış ₺</th><th>Satış ₺</th><th>Durum</th><th>İşlem</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{fontFamily:'monospace',color:'#64748b'}}>{s.kod}</td>
                    <td style={{fontWeight:600}}>{s.ad}</td>
                    <td>{s.kategori}</td>
                    <td style={{fontWeight:700,color:s.miktar===0?'#dc2626':s.miktar<10?'#ca8a04':'#1e293b'}}>{s.miktar}</td>
                    <td>{s.birim}</td>
                    <td>₺{Number(s.alis_fiyat).toLocaleString()}</td>
                    <td>₺{Number(s.satis_fiyat).toLocaleString()}</td>
                    <td><span className={`badge ${durumBadge(s.durum)}`}>{s.durum}</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-secondary" style={{padding:'5px 10px'}} onClick={()=>{setForm({...s});setModal({mode:'edit',id:s.id})}}><Pencil size={14}/></button>
                        <button className="btn btn-danger" style={{padding:'5px 10px'}} onClick={()=>remove(s.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:'center',color:'#94a3b8',padding:40}}>Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{maxWidth:520}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 className="modal-title" style={{margin:0}}>{modal.mode==='add'?'Yeni Ürün':'Ürün Düzenle'}</h3>
              <button onClick={()=>setModal(null)} style={{background:'none',color:'#64748b'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group"><label>Stok Kodu</label><input className="form-input" value={form.kod} onChange={e=>setForm(p=>({...p,kod:e.target.value}))} /></div>
              <div className="form-group"><label>Ürün Adı</label><input className="form-input" value={form.ad} onChange={e=>setForm(p=>({...p,ad:e.target.value}))} autoFocus /></div>
              <div className="form-group"><label>Kategori</label><input className="form-input" value={form.kategori} onChange={e=>setForm(p=>({...p,kategori:e.target.value}))} /></div>
              <div className="form-group"><label>Birim</label>
                <select className="form-input" value={form.birim} onChange={e=>setForm(p=>({...p,birim:e.target.value}))}>
                  <option>Adet</option><option>Paket</option><option>Kg</option><option>Litre</option><option>Metre</option>
                </select>
              </div>
              <div className="form-group"><label>Miktar</label><input className="form-input" type="number" value={form.miktar} onChange={e=>setForm(p=>({...p,miktar:e.target.value}))} /></div>
              <div className="form-group"><label>Alış Fiyatı (₺)</label><input className="form-input" type="number" value={form.alis_fiyat} onChange={e=>setForm(p=>({...p,alis_fiyat:e.target.value}))} /></div>
              <div className="form-group"><label>Satış Fiyatı (₺)</label><input className="form-input" type="number" value={form.satis_fiyat} onChange={e=>setForm(p=>({...p,satis_fiyat:e.target.value}))} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={()=>setModal(null)}>İptal</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Kaydediliyor...':'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
