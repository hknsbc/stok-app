import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, BarChart2, CreditCard } from 'lucide-react';
import { supabase } from '../supabase';

const planLabels = { baslangic:'Başlangıç', pro:'Pro', kurumsal:'Kurumsal' };
const planColors = { baslangic:'#64748b', pro:'#2563eb', kurumsal:'#7c3aed' };

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
    <div>
      <p style={{fontSize:13,color:'#64748b',marginBottom:6}}>{label}</p>
      <p style={{fontSize:24,fontWeight:800,color:'#1e293b'}}>{value}</p>
    </div>
    <div style={{width:48,height:48,borderRadius:12,background:color+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <Icon size={22} color={color}/>
    </div>
  </div>
);

const ModuleCard = ({ label, desc, value, valueSub, icon: Icon, color, onOpen }) => (
  <div className="card" style={{display:'flex',flexDirection:'column',gap:12}}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
      <div style={{width:48,height:48,borderRadius:12,background:color,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon size={22} color="#fff"/>
      </div>
      <div style={{textAlign:'right'}}>
        <p style={{fontSize:24,fontWeight:800,color:'#1e293b'}}>{value}</p>
        <p style={{fontSize:12,color:'#94a3b8'}}>{valueSub}</p>
      </div>
    </div>
    <div>
      <p style={{fontWeight:700,fontSize:15,color:'#1e293b'}}>{label}</p>
      <p style={{fontSize:13,color:'#64748b',marginTop:2}}>{desc}</p>
    </div>
    <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={onOpen}>Aç</button>
  </div>
);

export default function Dashboard({ user, profile, company, onNavigate }) {
  const [stats, setStats] = useState({ cari:0, stok:0, alislar:0, satislar:0, satisToplamı:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?.id) return;
    const load = async () => {
      const [{ count: cari }, { count: stok }, { count: alislar }, { data: satisData }] = await Promise.all([
        supabase.from('cari').select('id', { count:'exact', head:true }).eq('company_id', company.id),
        supabase.from('stok').select('id', { count:'exact', head:true }).eq('company_id', company.id),
        supabase.from('alislar').select('id', { count:'exact', head:true }).eq('company_id', company.id),
        supabase.from('satislar').select('toplam,durum').eq('company_id', company.id),
      ]);
      const satisToplamı = (satisData||[]).filter(s=>s.durum==='Tamamlandı').reduce((s,a)=>s+Number(a.toplam),0);
      setStats({ cari:cari||0, stok:stok||0, alislar:alislar||0, satislar:(satisData||[]).length, satisToplamı });
      setLoading(false);
    };
    load();
  }, [company?.id]);

  const plan = company?.plan || 'baslangic';

  return (
    <div>
      {/* Welcome */}
      <div style={{background:'linear-gradient(120deg,#1e40af,#2563eb,#3b82f6)',borderRadius:16,padding:'28px 32px',marginBottom:24,color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h2 style={{fontSize:24,fontWeight:800,marginBottom:8}}>Hoş Geldiniz! {profile?.full_name || user?.email?.split('@')[0]}</h2>
          <p style={{opacity:.85,fontSize:15}}>Stok yönetim sisteminize giriş yaptınız. Aşağıdan işlemlerinizi başlatabilirsiniz.</p>
          {company && (
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12}}>
              <span style={{fontSize:13,opacity:.8}}>{company.name}</span>
              <span style={{background:'rgba(255,255,255,0.2)',padding:'2px 10px',borderRadius:99,fontSize:12,fontWeight:700}}>{planLabels[plan]}</span>
            </div>
          )}
        </div>
        <div style={{width:80,height:80,background:'rgba(255,255,255,0.15)',borderRadius:16}}/>
      </div>

      {/* Stats */}
      {!loading && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
          <StatCard label="Toplam Cari" value={stats.cari} icon={Users} color="#2563eb"/>
          <StatCard label="Toplam Stok" value={stats.stok} icon={Package} color="#7c3aed"/>
          <StatCard label="Bu Ay Satışlar" value={`₺${(stats.satisToplamı/1000).toFixed(0)}K`} icon={TrendingUp} color="#16a34a"/>
          <StatCard label="Lisans Durumu" value="Aktif" icon={CreditCard} color="#ea580c"/>
        </div>
      )}

      {/* Modules */}
      <h3 style={{fontWeight:700,fontSize:17,color:'#1e293b',marginBottom:16}}>Ana Modüller</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        <ModuleCard label="Cari" desc="Müşteri ve tedarikçi kartlarını yönetin" value={stats.cari} valueSub="Kayıtlı Cari" icon={Users} color="#2563eb" onOpen={()=>onNavigate('cari')}/>
        <ModuleCard label="Stok" desc="Ürün envanterini takip edin" value={stats.stok} valueSub="Toplam Ürün" icon={Package} color="#7c3aed" onOpen={()=>onNavigate('stok')}/>
        <ModuleCard label="Alışlar" desc="Satın alma işlemlerini kaydedin" value={stats.alislar} valueSub="Fatura" icon={ShoppingCart} color="#16a34a" onOpen={()=>onNavigate('alislar')}/>
        <ModuleCard label="Satışlar" desc="Satış işlemlerini kaydedin" value={stats.satislar} valueSub="Fatura" icon={TrendingUp} color="#ea580c" onOpen={()=>onNavigate('satislar')}/>
        <ModuleCard label="Raporlar" desc="Finansal raporları görüntüleyin" value={stats.alislar+stats.satislar} valueSub="Kayıt" icon={BarChart2} color="#0891b2" onOpen={()=>onNavigate('raporlar')}/>
        <ModuleCard label="Abonelik" desc="Plan ve abonelik bilgileriniz" value={planLabels[plan]} valueSub="Plan" icon={CreditCard} color="#db2777" onOpen={()=>onNavigate('abonelik')}/>
      </div>
    </div>
  );
}
