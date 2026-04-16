import { Home, Users, Package, ShoppingCart, TrendingUp, BarChart2, CreditCard, Shield, User, LogOut, Settings } from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Ana Sayfa', icon: Home },
  { key: 'cari', label: 'Cari', icon: Users },
  { key: 'stok', label: 'Stok', icon: Package },
  { key: 'alislar', label: 'Alışlar', icon: ShoppingCart },
  { key: 'satislar', label: 'Satışlar', icon: TrendingUp },
  { key: 'raporlar', label: 'Raporlar', icon: BarChart2 },
  { key: 'abonelik', label: 'Abonelik', icon: CreditCard },
  { key: 'lisans', label: 'Lisans', icon: Shield },
];

const planLabels = { baslangic: 'Başlangıç', pro: 'Pro', kurumsal: 'Kurumsal' };
const planColors = { baslangic: '#64748b', pro: '#2563eb', kurumsal: '#7c3aed' };

export default function Layout({ user, profile, company, activePage, onNavigate, onLogout, isSuperAdmin, children }) {
  const today = new Date().toLocaleDateString('tr-TR', { day:'2-digit', month:'2-digit', year:'numeric' });
  const plan = company?.plan || 'baslangic';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Package size={18} color="#fff" />
            </div>
            <span style={{ color:'#f1f5f9', fontWeight:800, fontSize:17 }}>Stok Takip</span>
          </div>
          {company && (
            <div style={{ background:'#1e293b', borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ color:'#94a3b8', fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120 }}>{company.name}</span>
              <span style={{ fontSize:11, fontWeight:700, color: planColors[plan], background: planColors[plan]+'20', padding:'2px 7px', borderRadius:99 }}>{planLabels[plan]}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          {navItems.map(({ key, label, icon: Icon }) => {
            const active = activePage === key;
            return (
              <button key={key} onClick={() => onNavigate(key)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'9px 12px', borderRadius:10, marginBottom:2,
                  background: active ? '#2563eb' : 'transparent',
                  color: active ? '#fff' : '#94a3b8',
                  fontSize:14, fontWeight: active ? 600 : 400,
                  border:'none', cursor:'pointer', transition:'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='#1e293b'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
              >
                <Icon size={17} /> {label}
              </button>
            );
          })}

          {isSuperAdmin && (
            <>
              <div style={{ height:1, background:'#1e293b', margin:'10px 8px' }} />
              <button onClick={() => onNavigate('admin')}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'9px 12px', borderRadius:10,
                  background: activePage==='admin' ? '#7c3aed' : 'transparent',
                  color: activePage==='admin' ? '#fff' : '#a78bfa',
                  fontSize:14, fontWeight:600, border:'none', cursor:'pointer',
                }}
                onMouseEnter={e => { if (activePage!=='admin') e.currentTarget.style.background='#1e293b'; }}
                onMouseLeave={e => { if (activePage!=='admin') e.currentTarget.style.background='transparent'; }}
              >
                <Settings size={17} /> Admin Panel
              </button>
            </>
          )}
        </nav>

        {/* User area */}
        <div style={{ borderTop:'1px solid #1e293b', padding:'10px 8px' }}>
          <div style={{ padding:'8px 12px', marginBottom:4, borderRadius:10, background:'#1e293b' }}>
            <p style={{ color:'#f1f5f9', fontSize:13, fontWeight:600 }}>{profile?.full_name || user?.email}</p>
            <p style={{ color:'#64748b', fontSize:11 }}>{profile?.role === 'superadmin' ? '⭐ Super Admin' : profile?.role === 'owner' ? 'Hesap Sahibi' : 'Kullanıcı'}</p>
          </div>
          <button onClick={onLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, color:'#f87171', fontSize:14, background:'transparent', border:'none', cursor:'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background='#1e293b'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <LogOut size={16} /> Çıkış
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:240, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 28px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
          <span style={{ color:'#1e293b', fontWeight:600, fontSize:15 }}>
            {navItems.find(n=>n.key===activePage)?.label || (activePage==='admin'?'Admin Panel':'Ana Sayfa')}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:13, color:'#64748b' }}>{today}</span>
            {isSuperAdmin && <span style={{ fontSize:12, fontWeight:700, color:'#7c3aed', background:'#f3e8ff', padding:'3px 10px', borderRadius:8 }}>⭐ Super Admin</span>}
          </div>
        </header>
        <div style={{ flex:1, padding:24, overflowY:'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
