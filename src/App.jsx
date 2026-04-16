import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cari from './pages/Cari';
import Stok from './pages/Stok';
import Alislar from './pages/Alislar';
import Satislar from './pages/Satislar';
import Raporlar from './pages/Raporlar';
import Abonelik from './pages/Abonelik';
import Lisans from './pages/Lisans';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    // Mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (authUser) => {
    const { data } = await supabase
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', authUser.id)
      .single();
    setUser(authUser);
    setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActivePage('dashboard');
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, border:'4px solid #e2e8f0', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
          <p style={{ color:'#64748b', fontSize:14 }}>Yükleniyor...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login onLogin={(u) => { setUser(u); loadProfile(u); }} />;
  }

  const isSuperAdmin = profile?.role === 'superadmin';
  const company = profile?.companies;

  const pages = {
    dashboard: <Dashboard user={user} profile={profile} company={company} onNavigate={setActivePage} />,
    cari: <Cari companyId={company?.id} />,
    stok: <Stok companyId={company?.id} plan={company?.plan} />,
    alislar: <Alislar companyId={company?.id} />,
    satislar: <Satislar companyId={company?.id} />,
    raporlar: <Raporlar companyId={company?.id} />,
    abonelik: <Abonelik company={company} />,
    lisans: <Lisans company={company} profile={profile} />,
    admin: isSuperAdmin ? <AdminPanel /> : null,
  };

  return (
    <Layout user={user} profile={profile} company={company} activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} isSuperAdmin={isSuperAdmin}>
      {pages[activePage] || pages.dashboard}
    </Layout>
  );
}
