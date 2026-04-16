import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';

const empty = { ad:'', tip:'Müşteri', telefon:'', email:'', bakiye:0, durum:'Aktif' };

export default function Cari({ companyId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('cari').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = list.filter(c =>
    c.ad.toLowerCase().includes(q.toLowerCase()) || (c.email||'').toLowerCase().includes(q.toLowerCase())
  );

  const save = async () => {
    if (!form.ad.trim()) return;
    setSaving(true);
    const payload = { ...form, bakiye: Number(form.bakiye), company_id: companyId };
    if (modal.mode === 'add') {
      await supabase.from('cari').insert(payload);
    } else {
      await supabase.from('cari').update(payload).eq('id', modal.id);
    }
    await fetch();
    setModal(null);
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Bu cariyi silmek istediğinizden emin misiniz?')) return;
    await supabase.from('cari').delete().eq('id', id);
    setList(p => p.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Cari Yönetimi <span style={{fontSize:14,fontWeight:400,color:'#94a3b8'}}>({list.length})</span></h2>
        <div style={{ display:'flex', gap:10 }}>
          <div className="search-wrap">
            <Search size={15} />
            <input className="search-input" placeholder="Cari ara..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={fetch}><RefreshCw size={15} /></button>
          <button className="btn btn-primary" onClick={()=>{setForm(empty);setModal({mode:'add'})}}><Plus size={16}/> Yeni Cari</button>
        </div>
      </div>

      <div className="card">
        {loading ? <p style={{textAlign:'center',padding:40,color:'#94a3b8'}}>Yükleniyor...</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ad / Unvan</th><th>Tip</th><th>Telefon</th><th>E-posta</th><th>Bakiye</th><th>Durum</th><th>İşlem</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight:600}}>{c.ad}</td>
                    <td><span className={`badge ${c.tip==='Müşteri'?'badge-blue':'badge-orange'}`}>{c.tip}</span></td>
                    <td>{c.telefon}</td><td>{c.email}</td>
                    <td style={{fontWeight:600,color:c.bakiye<0?'#dc2626':c.bakiye>0?'#16a34a':'#64748b'}}>
                      {c.bakiye<0?'-':''}₺{Math.abs(c.bakiye).toLocaleString()}
                    </td>
                    <td><span className={`badge ${c.durum==='Aktif'?'badge-green':'badge-gray'}`}>{c.durum}</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-secondary" style={{padding:'5px 10px'}} onClick={()=>{setForm({...c});setModal({mode:'edit',id:c.id})}}><Pencil size={14}/></button>
                        <button className="btn btn-danger" style={{padding:'5px 10px'}} onClick={()=>remove(c.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={7} style={{textAlign:'center',color:'#94a3b8',padding:40}}>Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 className="modal-title" style={{margin:0}}>{modal.mode==='add'?'Yeni Cari':'Cari Düzenle'}</h3>
              <button onClick={()=>setModal(null)} style={{background:'none',color:'#64748b'}}><X size={20}/></button>
            </div>
            <div className="form-group"><label>Ad / Unvan</label><input className="form-input" value={form.ad} onChange={e=>setForm(p=>({...p,ad:e.target.value}))} autoFocus /></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group"><label>Tip</label>
                <select className="form-input" value={form.tip} onChange={e=>setForm(p=>({...p,tip:e.target.value}))}>
                  <option>Müşteri</option><option>Tedarikçi</option>
                </select>
              </div>
              <div className="form-group"><label>Durum</label>
                <select className="form-input" value={form.durum} onChange={e=>setForm(p=>({...p,durum:e.target.value}))}>
                  <option>Aktif</option><option>Pasif</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Telefon</label><input className="form-input" value={form.telefon} onChange={e=>setForm(p=>({...p,telefon:e.target.value}))} /></div>
            <div className="form-group"><label>E-posta</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
            <div className="form-group"><label>Bakiye (₺)</label><input className="form-input" type="number" value={form.bakiye} onChange={e=>setForm(p=>({...p,bakiye:e.target.value}))} /></div>
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
