import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';

const durumBadge = (d) => d==='Tamamlandı'?'badge-green':d==='Beklemede'?'badge-yellow':'badge-red';
const emptyForm = { tedarikci:'', tarih:new Date().toISOString().slice(0,10), toplam:0, durum:'Beklemede' };

export default function Alislar({ companyId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [cariList, setCariList] = useState([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [{ data: alisData }, { data: cariData }] = await Promise.all([
      supabase.from('alislar').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
      supabase.from('cari').select('id,ad,tip').eq('company_id', companyId).eq('tip','Tedarikçi'),
    ]);
    setList(alisData || []);
    setCariList(cariData || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = list.filter(a => (a.no||'').includes(q) || (a.tedarikci||'').toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!form.tedarikci) return;
    setSaving(true);
    const no = `ALI-${new Date().getFullYear()}-${String(list.length+1).padStart(3,'0')}`;
    await supabase.from('alislar').insert({ ...form, no, toplam: Number(form.toplam), company_id: companyId });
    await fetch();
    setModal(false);
    setSaving(false);
  };

  const toplamTutar = list.reduce((s,a)=>s+Number(a.toplam),0);
  const tamamlanan = list.filter(a=>a.durum==='Tamamlandı').length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Alış Faturaları</h2>
        <div style={{display:'flex',gap:10}}>
          <div className="search-wrap"><Search size={15}/><input className="search-input" placeholder="Fatura ara..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="btn btn-secondary" onClick={fetch}><RefreshCw size={15}/></button>
          <button className="btn btn-primary" onClick={()=>{setForm({...emptyForm});setModal(true)}}><Plus size={16}/> Yeni Alış</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
        <div className="card"><p style={{color:'#64748b',fontSize:13}}>Toplam Fatura</p><p style={{fontSize:24,fontWeight:800,marginTop:4}}>{list.length}</p></div>
        <div className="card"><p style={{color:'#64748b',fontSize:13}}>Toplam Tutar</p><p style={{fontSize:24,fontWeight:800,marginTop:4,color:'#2563eb'}}>₺{toplamTutar.toLocaleString()}</p></div>
        <div className="card"><p style={{color:'#64748b',fontSize:13}}>Tamamlanan</p><p style={{fontSize:24,fontWeight:800,marginTop:4,color:'#16a34a'}}>{tamamlanan}</p></div>
      </div>

      <div className="card">
        {loading?<p style={{textAlign:'center',padding:40,color:'#94a3b8'}}>Yükleniyor...</p>:(
          <div className="table-wrap">
            <table>
              <thead><tr><th>Fatura No</th><th>Tarih</th><th>Tedarikçi</th><th>Tutar</th><th>Durum</th></tr></thead>
              <tbody>
                {filtered.map(a=>(
                  <tr key={a.id}>
                    <td style={{fontFamily:'monospace',fontWeight:600}}>{a.no}</td>
                    <td>{a.tarih}</td><td>{a.tedarikci}</td>
                    <td style={{fontWeight:700}}>₺{Number(a.toplam).toLocaleString()}</td>
                    <td><span className={`badge ${durumBadge(a.durum)}`}>{a.durum}</span></td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan={5} style={{textAlign:'center',color:'#94a3b8',padding:40}}>Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 className="modal-title" style={{margin:0}}>Yeni Alış Faturası</h3>
              <button onClick={()=>setModal(false)} style={{background:'none',color:'#64748b'}}><X size={20}/></button>
            </div>
            <div className="form-group"><label>Tedarikçi</label>
              <select className="form-input" value={form.tedarikci} onChange={e=>setForm(p=>({...p,tedarikci:e.target.value}))}>
                <option value="">Seçiniz...</option>
                {cariList.map(c=><option key={c.id}>{c.ad}</option>)}
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group"><label>Tarih</label><input className="form-input" type="date" value={form.tarih} onChange={e=>setForm(p=>({...p,tarih:e.target.value}))}/></div>
              <div className="form-group"><label>Tutar (₺)</label><input className="form-input" type="number" value={form.toplam} onChange={e=>setForm(p=>({...p,toplam:e.target.value}))}/></div>
            </div>
            <div className="form-group"><label>Durum</label>
              <select className="form-input" value={form.durum} onChange={e=>setForm(p=>({...p,durum:e.target.value}))}>
                <option>Beklemede</option><option>Tamamlandı</option><option>İptal</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={()=>setModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Kaydediliyor...':'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
