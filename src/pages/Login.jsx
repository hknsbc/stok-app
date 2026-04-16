import { useState } from 'react';
import { Lock, LogIn, UserPlus, Building2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ fullName: '', companyName: '', email: '', password: '', password2: '' });

  // GİRİŞ
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) { setError(error.message); setLoading(false); return; }

    // Profil bilgisini çek
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', data.user.id)
      .single();

    onLogin({ ...data.user, profile });
    setLoading(false);
  };

  // KAYIT
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.password2) { setError('Şifreler eşleşmiyor'); return; }
    if (regForm.password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return; }
    if (!regForm.companyName.trim()) { setError('Şirket adı zorunludur'); return; }
    setLoading(true);

    // 1. Şirket oluştur
    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .insert({ name: regForm.companyName.trim(), plan: 'baslangic' })
      .select()
      .single();

    if (companyErr) { setError(companyErr.message); setLoading(false); return; }

    // 2. Auth user oluştur (trigger profile'ı otomatik yaratır)
    const { error: authErr } = await supabase.auth.signUp({
      email: regForm.email,
      password: regForm.password,
      options: {
        data: {
          full_name: regForm.fullName,
          company_id: company.id,
          role: 'owner',
        }
      }
    });

    if (authErr) {
      // Şirketi geri sil
      await supabase.from('companies').delete().eq('id', company.id);
      setError(authErr.message);
      setLoading(false);
      return;
    }

    setSuccess('Kayıt başarılı! E-posta doğrulaması gerekmiyorsa giriş yapabilirsiniz.');
    setLoading(false);
    setTab('login');
    setLoginForm({ email: regForm.email, password: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', width: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Lock size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>Stok Takip</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Envanter Yönetim Sistemi</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[['login','Giriş Yap'],['register','Üye Ol']].map(([key,label]) => (
            <button key={key} onClick={() => { setTab(key); setError(''); setSuccess(''); }}
              style={{ flex:1, padding:'8px', borderRadius:8, fontSize:14, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s',
                background: tab===key ? '#fff' : 'transparent',
                color: tab===key ? '#1e293b' : '#64748b',
                boxShadow: tab===key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{error}</div>}
        {success && <div style={{ background:'#dcfce7', color:'#16a34a', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{success}</div>}

        {/* GİRİŞ FORMU */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>E-posta</label>
              <input className="form-input" type="email" placeholder="ornek@firma.com" value={loginForm.email}
                onChange={e => setLoginForm(p=>({...p,email:e.target.value}))} autoFocus required />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <input className="form-input" type="password" placeholder="Şifreniz" value={loginForm.password}
                onChange={e => setLoginForm(p=>({...p,password:e.target.value}))} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15, marginTop:4 }}>
              {loading ? 'Giriş yapılıyor...' : <><LogIn size={18} /> Giriş Yap</>}
            </button>
          </form>
        )}

        {/* KAYIT FORMU */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Ad Soyad</label>
              <input className="form-input" placeholder="Ad Soyad" value={regForm.fullName}
                onChange={e => setRegForm(p=>({...p,fullName:e.target.value}))} required autoFocus />
            </div>
            <div className="form-group">
              <label><Building2 size={13} style={{display:'inline',marginRight:4}} />Şirket / İşletme Adı</label>
              <input className="form-input" placeholder="Şirket adınız" value={regForm.companyName}
                onChange={e => setRegForm(p=>({...p,companyName:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>E-posta</label>
              <input className="form-input" type="email" placeholder="ornek@firma.com" value={regForm.email}
                onChange={e => setRegForm(p=>({...p,email:e.target.value}))} required />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label>Şifre</label>
                <input className="form-input" type="password" placeholder="Min. 6 karakter" value={regForm.password}
                  onChange={e => setRegForm(p=>({...p,password:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Şifre Tekrar</label>
                <input className="form-input" type="password" placeholder="Şifre tekrar" value={regForm.password2}
                  onChange={e => setRegForm(p=>({...p,password2:e.target.value}))} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15, marginTop:4 }}>
              {loading ? 'Kayıt oluşturuluyor...' : <><UserPlus size={18} /> Ücretsiz Başla</>}
            </button>
            <p style={{ fontSize:12, color:'#94a3b8', textAlign:'center', marginTop:10 }}>
              30 gün ücretsiz deneme • Kredi kartı gerekmez
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
