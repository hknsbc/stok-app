"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

type Stats = { patients: number; todayExams: number; upcomingVaccines: number; monthRevenue: number };
type RecentExam = { id: string; pet_name: string; owner_name: string; diagnosis: string; date: string; total_cost: number };
type UpcomingVaccine = { id: string; pet_name: string; owner_name: string; owner_phone: string; vaccine_name: string; next_due_date: string; daysLeft: number };
type LowMedicine = { id: string; name: string; stock: number; category: string };

function sendWhatsApp(phone: string, petName: string, vaccineName: string, dueDate: string) {
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "90" + clean.slice(1) : clean.startsWith("90") ? clean : "90" + clean;
  const text = encodeURIComponent(
    `Sayın hayvan sahibi,\n\n${petName} adlı hayvanınızın *${vaccineName}* tarihi ${dueDate} olarak yaklaşmaktadır.\n\nRandevu almak için kliniğimizi arayabilirsiniz. 🐾`
  );
  window.open(`https://wa.me/${num}?text=${text}`, "_blank");
}

const VET_MEDICINE_CATEGORIES = ["Antibiyotik", "Anestezi", "Aşı", "Steroid", "Anti-paraziter", "Vitamin", "Serum", "Dezenfektan", "Pansuman", "Diğer İlaç"];

export default function VetDashboard() {
  const [stats, setStats] = useState<Stats>({ patients: 0, todayExams: 0, upcomingVaccines: 0, monthRevenue: 0 });
  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [vaccines, setVaccines] = useState<UpcomingVaccine[]>([]);
  const [lowMeds, setLowMeds] = useState<LowMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      const tid = profile?.tenant_id;
      if (!tid) return;

      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

      const [pRes, eRes, vRes, revRes, medsRes, examsRes] = await Promise.all([
        supabase.from("vet_patients").select("id", { count: "exact", head: true }).eq("tenant_id", tid),
        supabase.from("vet_examinations").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("date", today),
        supabase.from("vet_vaccines").select("id,pet_name,owner_name,owner_phone,vaccine_name,next_due_date").eq("tenant_id", tid).gte("next_due_date", today).lte("next_due_date", in30).order("next_due_date"),
        supabase.from("vet_examinations").select("total_cost").eq("tenant_id", tid).gte("date", monthStart),
        supabase.from("products").select("id,name,stock,category").eq("tenant_id", tid).in("category", VET_MEDICINE_CATEGORIES).lte("stock", 5),
        supabase.from("vet_examinations").select("id,pet_name,owner_name,diagnosis,date,total_cost").eq("tenant_id", tid).order("date", { ascending: false }).limit(5),
      ]);

      const monthRev = revRes.data?.reduce((a, r) => a + Number(r.total_cost || 0), 0) ?? 0;
      const vaccinesData: UpcomingVaccine[] = (vRes.data ?? []).map((v) => ({
        ...v,
        daysLeft: Math.ceil((new Date(v.next_due_date).getTime() - Date.now()) / 86400000),
      }));

      setStats({
        patients: pRes.count ?? 0,
        todayExams: eRes.count ?? 0,
        upcomingVaccines: vRes.data?.length ?? 0,
        monthRevenue: monthRev,
      });
      setVaccines(vaccinesData);
      setLowMeds((medsRes.data ?? []) as LowMedicine[]);
      setRecentExams((examsRes.data ?? []) as RecentExam[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#888" }}>Yükleniyor...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <style>{`
        .vet-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        @media (max-width: 1024px) { .vet-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .vet-grid { grid-template-columns: 1fr; } }
        .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
        @media (max-width: 768px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#0c4a6e", margin: 0 }}>🏥 Veteriner Klinik Paneli</h1>
        <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>Hasta kayıtları, aşı takibi ve muayene yönetimi</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: "Toplam Hasta", value: stats.patients, color: "#8b5cf6", icon: "🐾" },
          { label: "Bugünkü Muayene", value: stats.todayExams, color: "#0ea5e9", icon: "🩺" },
          { label: "Bekleyen Aşı (30 gün)", value: stats.upcomingVaccines, color: "#f59e0b", icon: "💉" },
          { label: "Aylık Gelir", value: `${stats.monthRevenue.toLocaleString("tr-TR")} TL`, color: "#10b981", icon: "💰" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="vet-grid">
        {/* Kolon 1: Aşı Takvimi */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>💉 Yaklaşan Aşılar</h2>
              <Link href="/vet/asi" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>Tümü →</Link>
            </div>
            {vaccines.length === 0 ? (
              <EmptyCard text="Yaklaşan aşı yok" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {vaccines.slice(0, 5).map((v) => (
                  <div key={v.id} style={{ padding: "10px 12px", borderRadius: 8, background: v.daysLeft <= 7 ? "#fef2f2" : "#fffbeb", border: `1px solid ${v.daysLeft <= 7 ? "#fecaca" : "#fde68a"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: "bold", fontSize: 13 }}>{v.pet_name}</span>
                      <span style={{ fontSize: 11, fontWeight: "bold", color: v.daysLeft <= 7 ? "#ef4444" : "#d97706" }}>{v.daysLeft} gün</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{v.vaccine_name} · {v.owner_name}</div>
                    {v.owner_phone && (
                      <button
                        onClick={() => sendWhatsApp(v.owner_phone, v.pet_name, v.vaccine_name, v.next_due_date)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "#25d366", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: "bold" }}
                      >
                        💬 WhatsApp
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>⚡ Hızlı İşlemler</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "➕ Yeni Hasta Kartı", href: "/vet/hastalar/yeni", color: "#8b5cf6" },
                { label: "🩺 Yeni Muayene", href: "/vet/muayene/yeni", color: "#0ea5e9" },
                { label: "💉 Aşı Ekle", href: "/vet/asi/yeni", color: "#f59e0b" },
                { label: "🧾 Fatura Oluştur", href: "/vet/fatura/yeni", color: "#10b981" },
              ].map((a) => (
                <Link key={a.href} href={a.href} style={{ display: "block", padding: "10px 14px", background: a.color + "12", border: `1px solid ${a.color}30`, borderRadius: 8, textDecoration: "none", color: a.color, fontWeight: 600, fontSize: 13 }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Kolon 2: Son Muayeneler */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>🩺 Son Muayeneler</h2>
              <Link href="/vet/muayene" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>Tümü →</Link>
            </div>
            {recentExams.length === 0 ? (
              <EmptyCard text="Henüz muayene kaydı yok" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentExams.map((e) => (
                  <Link key={e.id} href={`/vet/muayene/${e.id}`} style={{ display: "block", padding: "12px 14px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", textDecoration: "none", color: "inherit" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: "bold", fontSize: 14 }}>{e.pet_name}</span>
                      <span style={{ fontSize: 12, color: "#888" }}>{e.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#0c4a6e", marginBottom: 2 }}>🔍 {e.diagnosis || "—"}</div>
                    <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{Number(e.total_cost || 0).toLocaleString("tr-TR")} TL</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>🐾 Hasta Listesi</h2>
              <Link href="/vet/hastalar" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>Tümü →</Link>
            </div>
            <Link href="/vet/hastalar" style={{ display: "block", padding: "12px 14px", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, textDecoration: "none", textAlign: "center", color: "#8b5cf6", fontWeight: 600, fontSize: 13 }}>
              {stats.patients} hasta kaydı görüntüle →
            </Link>
          </div>
        </div>

        {/* Kolon 3: İlaç Stoku */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>💊 Kritik İlaç Stoku</h2>
              <Link href="/vet/stok" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>Tümü →</Link>
            </div>
            {lowMeds.length === 0 ? (
              <EmptyCard text="Kritik stok yok ✓" green />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lowMeds.map((m) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{m.category}</div>
                    </div>
                    <span style={{ fontWeight: "bold", fontSize: 14, color: m.stock === 0 ? "#ef4444" : "#f59e0b" }}>
                      {m.stock === 0 ? "Tükendi" : `${m.stock} adet`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>📊 Modüller</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Hasta Kartları", href: "/vet/hastalar", icon: "🐾" },
                { label: "Muayeneler", href: "/vet/muayene", icon: "🩺" },
                { label: "Aşı Takvimi", href: "/vet/asi", icon: "💉" },
                { label: "İlaç Stoku", href: "/vet/stok", icon: "💊" },
                { label: "Faturalar", href: "/vet/fatura", icon: "🧾" },
              ].map((m) => (
                <Link key={m.href} href={m.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", textDecoration: "none", color: "#374151", fontSize: 13, fontWeight: 500 }}>
                  <span>{m.icon}</span> {m.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EmptyCard({ text, green }: { text: string; green?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 12px", color: green ? "#10b981" : "#9ca3af", fontSize: 13 }}>{text}</div>
  );
}
