const planLabels = { baslangic:'Başlangıç', pro:'Pro', kurumsal:'Kurumsal' };

const plans = [
  { key:'baslangic', name:'Başlangıç', price:'₺299', features:['1 Kullanıcı','1.000 Ürün','Temel Raporlar','E-posta Destek'], color:'#64748b' },
  { key:'pro', name:'Pro', price:'₺599', features:['5 Kullanıcı','10.000 Ürün','Gelişmiş Raporlar','Öncelikli Destek','API Erişimi'], color:'#2563eb' },
  { key:'kurumsal', name:'Kurumsal', price:'₺1.299', features:['Sınırsız Kullanıcı','Sınırsız Ürün','Özel Raporlar','7/24 Destek','API Erişimi','Özel Entegrasyon'], color:'#7c3aed' },
];

export default function Abonelik({ company }) {
  const currentPlan = company?.plan || 'baslangic';
  const expires = company?.plan_expires_at ? new Date(company.plan_expires_at).toLocaleDateString('tr-TR') : '—';

  return (
    <div>
      <div className="page-header"><h2 className="page-title">Abonelik</h2></div>

      <div className="card" style={{marginBottom:24,background:'linear-gradient(120deg,#1e40af,#2563eb)',color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{opacity:.8,fontSize:14,marginBottom:4}}>Mevcut Planınız</p>
            <h3 style={{fontSize:24,fontWeight:800}}>{planLabels[currentPlan]} Plan</h3>
            <p style={{opacity:.8,fontSize:14,marginTop:4}}>Yenileme tarihi: {expires}</p>
          </div>
          <div style={{background:'rgba(255,255,255,0.15)',padding:'12px 24px',borderRadius:12}}>
            <p style={{fontSize:26,fontWeight:800}}>{plans.find(p=>p.key===currentPlan)?.price}<span style={{fontSize:14,fontWeight:400}}>/ay</span></p>
          </div>
        </div>
      </div>

      <h3 style={{fontSize:17,fontWeight:700,marginBottom:16,color:'#1e293b'}}>Plan Seçenekleri</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
        {plans.map(plan=>(
          <div key={plan.key} className="card" style={{border:`2px solid ${plan.key===currentPlan?plan.color:'#e2e8f0'}`,position:'relative'}}>
            {plan.key===currentPlan&&(
              <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:plan.color,color:'#fff',fontSize:12,fontWeight:700,padding:'3px 12px',borderRadius:99}}>Mevcut Plan</div>
            )}
            <h3 style={{fontSize:18,fontWeight:800,color:plan.color,marginBottom:4}}>{plan.name}</h3>
            <p style={{fontSize:26,fontWeight:800,color:'#1e293b'}}>{plan.price}<span style={{fontSize:13,fontWeight:400,color:'#64748b'}}>/ay</span></p>
            <ul style={{marginTop:14,listStyle:'none'}}>
              {plan.features.map(f=>(
                <li key={f} style={{fontSize:14,color:'#475569',padding:'5px 0',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:8}}>
                  <span style={{color:'#16a34a',fontWeight:700}}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="btn" style={{width:'100%',justifyContent:'center',marginTop:14,background:plan.key===currentPlan?plan.color:'#f1f5f9',color:plan.key===currentPlan?'#fff':'#475569'}}
              onClick={()=>plan.key!==currentPlan&&alert('Plan değişikliği için yönetici ile iletişime geçin.')}>
              {plan.key===currentPlan?'Mevcut Plan':'Plan Seçimi İçin İletişime Geç'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
