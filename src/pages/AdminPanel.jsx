import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { RefreshCw, Building2, Users, CheckCircle, XCircle } from 'lucide-react';

const planLabels = { baslangic:'Başlangıç', pro:'Pro', kurumsal:'Kurumsal' };
const planColors = { baslangic:'#64748b', pro:'#2563eb', kurumsal:'#7c3aed' };

export default function AdminPanel() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('companies')
      .select('*, profiles(id, full_name, role, created_at)')
      .order('created_at', { ascending: false });
    setCompanies(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updatePlan = async (id, plan) => {
    setUpdating(id);
    await supabase.from('companies').update({ plan }).eq('id', id);
    setCompanies(p => p.map(c => c.id===id ? {...c, plan} : c));
    setUpdating(null);
  };

  const toggleActive = async (id, current) => {
    setUpdating(id);
    await supabase.from('companies').update({ is_active: !current }).eq('id', id);
    setCompanies(p => p.map(c => c.id===id ? {...c, is_active: !current} : c));
    setUpdating(null);
  };

  const totalUsers = companies.reduce((s,c)=>(s+(c.profiles?.length||0)),0);
  const activeCompanies = companies.filter(c=>c.is_active).length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">⭐ Admin Paneli</h2>
        <button className="btn btn-secondary" onClick={fetch}><RefreshCw size={15}/> Yenile</button>
      </div>

      {/* Özet */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        {[
          { label:'Toplam Şirket', value:companies.length, color:'#2563eb', icon:Building2 },
          { label:'Aktif Şirket', value:activeCompanies, color:'#16a34a', icon:CheckCircle },
          { label:'Toplam Kullanıcı', value:totalUsers, color:'#7c3aed', icon:Users },
          { label:'Pro/Kurumsal', value:companies.filter(c=>c.plan!=='baslangic').length, color:'#ea580c', icon:Building2 },
        ].map(s=>(
          <div key={s.label} className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <p style={{fontSize:13,color:'#64748b',marginBottom:4}}>{s.label}</p>
              <p style={{fontSize:26,fontWeight:800,color:'#1e293b'}}>{s.value}</p>
            </div>
            <div style={{width:44,height:44,background:s.color+'20',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <s.icon size={20} color={s.color}/>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,color:'#1e293b'}}>Tüm Şirketler</h3>
        {loading ? <p style={{textAlign:'center',padding:40,color:'#94a3b8'}}>Yükleniyor...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Şirket Adı</th><th>Kullanıcılar</th><th>Plan</th><th>Durum</th><th>Kayıt Tarihi</th><th>Plan Değiştir</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight:600}}>{c.name}</td>
                    <td>
                      <div style={{display:'flex',flexDirection:'column',gap:2}}>
                        {(c.profiles||[]).map(p=>(
                          <span key={p.id} style={{fontSize:12,color:'#475569'}}>{p.full_name||'—'} <span style={{color:'#94a3b8'}}>({p.role})</span></span>
                        ))}
                        {!(c.profiles||[]).length && <span style={{color:'#94a3b8',fontSize:12}}>Kullanıcı yok</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{fontSize:12,fontWeight:700,color:planColors[c.plan]||'#64748b',background:(planColors[c.plan]||'#64748b')+'20',padding:'3px 10px',borderRadius:99}}>
                        {planLabels[c.plan]||c.plan}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.is_active?'badge-green':'badge-red'}`}>{c.is_active?'Aktif':'Pasif'}</span>
                    </td>
                    <td style={{fontSize:13,color:'#64748b'}}>{new Date(c.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <select
                        className="form-input"
                        style={{padding:'5px 8px',fontSize:12,width:120}}
                        value={c.plan}
                        disabled={updating===c.id}
                        onChange={e=>updatePlan(c.id,e.target.value)}
                      >
                        <option value="baslangic">Başlangıç</option>
                        <option value="pro">Pro</option>
                        <option value="kurumsal">Kurumsal</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className={`btn ${c.is_active?'btn-danger':'btn-success'}`}
                        style={{padding:'5px 12px',fontSize:12}}
                        disabled={updating===c.id}
                        onClick={()=>toggleActive(c.id,c.is_active)}
                      >
                        {updating===c.id?'...':(c.is_active?'Pasif Et':'Aktif Et')}
                      </button>
                    </td>
                  </tr>
                ))}
                {companies.length===0&&(
                  <tr><td colSpan={7} style={{textAlign:'center',color:'#94a3b8',padding:40}}>Henüz kayıtlı şirket yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
