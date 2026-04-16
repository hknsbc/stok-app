import { Shield, CheckCircle } from 'lucide-react';

const planFeatures = {
  baslangic: ['Cari Yönetimi','Stok Takibi (1.000 ürün)','Alış/Satış Faturaları','Temel Raporlar','1 Kullanıcı Hesabı'],
  pro: ['Cari Yönetimi','Stok Takibi (10.000 ürün)','Alış/Satış Faturaları','Gelişmiş Raporlar','5 Kullanıcı Hesabı','API Erişimi','Öncelikli Destek'],
  kurumsal: ['Cari Yönetimi','Sınırsız Stok Takibi','Alış/Satış Faturaları','Özel Raporlar','Sınırsız Kullanıcı','API Erişimi','7/24 Destek','Özel Entegrasyon'],
};

const planLabels = { baslangic:'Başlangıç', pro:'Pro', kurumsal:'Kurumsal' };

export default function Lisans({ company, profile }) {
  const plan = company?.plan || 'baslangic';
  const features = planFeatures[plan] || planFeatures.baslangic;
  const expires = company?.plan_expires_at ? new Date(company.plan_expires_at).toLocaleDateString('tr-TR') : '—';

  return (
    <div>
      <div className="page-header"><h2 className="page-title">Lisans Bilgileri</h2></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{width:48,height:48,background:'#dcfce7',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Shield size={24} color="#16a34a"/>
            </div>
            <div>
              <h3 style={{fontSize:18,fontWeight:800,color:'#1e293b'}}>Lisans Durumu</h3>
              <span className="badge badge-green">Aktif</span>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {[
              ['Lisans Tipi', planLabels[plan]],
              ['Hesap Sahibi', profile?.full_name || '—'],
              ['Şirket', company?.name || '—'],
              ['E-posta', '(Supabase Auth)'],
              ['Başlangıç Tarihi', company?.created_at ? new Date(company.created_at).toLocaleDateString('tr-TR') : '—'],
              ['Bitiş Tarihi', expires],
            ].map(([label, value]) => (
              <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f1f5f9'}}>
                <span style={{fontSize:13,color:'#64748b'}}>{label}</span>
                <span style={{fontSize:14,fontWeight:600,color:'#1e293b'}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,color:'#1e293b'}}>Lisans Kapsamı ({planLabels[plan]})</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {features.map(f=>(
              <div key={f} style={{display:'flex',alignItems:'center',gap:10}}>
                <CheckCircle size={18} color="#16a34a"/><span style={{fontSize:14,color:'#334155'}}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:24,background:'#f8fafc',borderRadius:10,padding:16}}>
            <p style={{fontSize:13,color:'#64748b',marginBottom:8}}>Plan yükseltmek veya uzatmak için:</p>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>alert('Yönetici ile iletişime geçin.')}>
              Planı Yükselt / Yenile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
