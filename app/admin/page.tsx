"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  is_active: boolean;
  is_superadmin: boolean;
  subscription_starts_at: string | null;
  subscription_expires_at: string | null;
  plan: string | null;
};

type ExpiringSoon = {
  id: string;
  email: string;
  daysLeft: number;
  plan: string | null;
  expiresAt: string;
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  estimatedMRR: number;
  expiringSoon: ExpiringSoon[];
  planCounts: Record<string, number>;
};

export default function AdminPanel() {
  const { t, lang } = useLang();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<Record<string, string>>({});
  const [editExpiry, setEditExpiry] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("is_superadmin").eq("id", session.user.id).single();
      if (!profile?.is_superadmin) { router.replace("/"); return; }

      setToken(session.access_token);
      await Promise.all([
        fetchUsers(session.access_token),
        fetchStats(session.access_token),
      ]);
    };
    init();
  }, [router]);

  const fetchUsers = async (tok: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!res.ok) { router.replace("/"); return; }
    const data = await res.json();
    setUsers(data);
    const startMap: Record<string, string> = {};
    const expMap: Record<string, string> = {};
    for (const u of data) {
      startMap[u.id] = u.subscription_starts_at ? u.subscription_starts_at.split("T")[0] : "";
      expMap[u.id] = u.subscription_expires_at ? u.subscription_expires_at.split("T")[0] : "";
    }
    setEditStart(startMap);
    setEditExpiry(expMap);
    setLoading(false);
  };

  const fetchStats = async (tok: string) => {
    const res = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (res.ok) setStats(await res.json());
  };

  const apiPatch = async (id: string, body: object) => {
    if (!token) return;
    setSaving(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    await Promise.all([fetchUsers(token), fetchStats(token)]);
    setSaving(null);
  };

  const handleToggleActive = (user: AdminUser) => {
    if (!confirm(t.adminConfirmToggle(user.email, !user.is_active))) return;
    apiPatch(user.id, { is_active: !user.is_active });
  };

  const handleSetDates = (id: string) => {
    apiPatch(id, {
      subscription_starts_at: editStart[id] || null,
      subscription_expires_at: editExpiry[id] || null,
    });
  };

  const handleDelete = async (user: AdminUser) => {
    if (!token) return;
    if (!confirm(t.adminConfirmDelete(user.email))) return;
    setSaving(user.id);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await Promise.all([fetchUsers(token!), fetchStats(token!)]);
    setSaving(null);
  };

  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const th: React.CSSProperties = {
    padding: "10px 14px", textAlign: "left", fontSize: 12,
    color: "#555", fontWeight: 600, borderBottom: "2px solid #eee",
  };
  const td: React.CSSProperties = {
    padding: "10px 14px", fontSize: 13,
    borderBottom: "1px solid #f3f4f6", verticalAlign: "middle",
  };

  if (loading) return (
    <DashboardLayout>
      <p style={{ color: "#888" }}>{t.loading}</p>
    </DashboardLayout>
  );

  const statCards = [
    {
      label: "Toplam Kullanıcı",
      value: stats?.totalUsers ?? users.length,
      color: "#6366f1",
      icon: "👥",
      sub: `${stats?.activeUsers ?? 0} aktif abonelik`,
    },
    {
      label: "Tahmini Aylık Ciro",
      value: `₺${(stats?.estimatedMRR ?? 0).toLocaleString("tr-TR")}`,
      color: "#10b981",
      icon: "💰",
      sub: "Aktif aboneliklerden",
    },
    {
      label: "30 Gün İçinde Bitiyor",
      value: stats?.expiringSoon.length ?? 0,
      color: (stats?.expiringSoon.length ?? 0) > 0 ? "#f59e0b" : "#10b981",
      icon: (stats?.expiringSoon.length ?? 0) > 0 ? "⚠️" : "✓",
      sub: "Abonelik bitiş uyarısı",
    },
    {
      label: "Süresi Dolmuş",
      value: stats?.expiredUsers ?? 0,
      color: (stats?.expiredUsers ?? 0) > 0 ? "#ef4444" : "#10b981",
      icon: (stats?.expiredUsers ?? 0) > 0 ? "🔴" : "✓",
      sub: "Yenilenmeyi bekliyor",
    },
  ];

  const planLabels: Record<string, string> = {
    temel: "Temel",
    profesyonel: "Profesyonel",
    kurumsal: "Kurumsal",
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header + tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 style={{ fontSize: 26, fontWeight: "bold", margin: 0 }}>⚙️ {t.adminTitle}</h1>
            <span style={{
              background: "#6366f1", color: "white", borderRadius: 20,
              padding: "3px 14px", fontSize: 13, fontWeight: 600,
            }}>
              {users.length} {t.adminUsers}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["overview", "users"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 13,
                  background: activeTab === tab ? "#6366f1" : "#f3f4f6",
                  color: activeTab === tab ? "white" : "#555",
                }}
              >
                {tab === "overview" ? "📊 Genel Bakış" : "👥 Kullanıcılar"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {statCards.map((s) => (
                <div key={s.label} style={{
                  background: "white", borderRadius: 14, padding: "20px 22px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${s.color}`,
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: "bold", color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", marginTop: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Expiry warnings */}
            {(stats?.expiringSoon.length ?? 0) > 0 && (
              <div style={{
                background: "white", borderRadius: 14, padding: 24,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 24,
                border: "1px solid #fde68a",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>⚠️</span> Aboneliği Yakında Bitecek Kullanıcılar
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stats!.expiringSoon.map((u) => (
                    <div key={u.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 10,
                      background: u.daysLeft <= 7 ? "#fef2f2" : "#fffbeb",
                      border: `1px solid ${u.daysLeft <= 7 ? "#fecaca" : "#fde68a"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: u.daysLeft <= 7 ? "#fee2e2" : "#fef9c3",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "bold", fontSize: 13,
                          color: u.daysLeft <= 7 ? "#dc2626" : "#854d0e",
                        }}>
                          {u.email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{u.email}</div>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            Plan: {planLabels[u.plan ?? ""] ?? u.plan ?? "—"} · Bitiş:{" "}
                            {new Date(u.expiresAt).toLocaleDateString(locale)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold",
                          background: u.daysLeft <= 7 ? "#ef4444" : "#f59e0b",
                          color: "white",
                        }}>
                          {u.daysLeft} gün kaldı
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan dağılımı */}
            {stats?.planCounts && Object.keys(stats.planCounts).length > 0 && (
              <div style={{
                background: "white", borderRadius: 14, padding: 24,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>
                  📈 Plan Dağılımı
                </h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {Object.entries(stats.planCounts).map(([plan, count]) => (
                    <div key={plan} style={{
                      padding: "14px 24px", borderRadius: 10,
                      background: "#f9fafb", border: "1px solid #e5e7eb",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 24, fontWeight: "bold", color: "#6366f1" }}>{count}</div>
                      <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                        {planLabels[plan] ?? plan}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "users" && (
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={th}>{t.adminEmailCol}</th>
                    <th style={th}>{t.adminRegDate}</th>
                    <th style={th}>{t.adminStatus}</th>
                    <th style={th}>{t.adminPlan}</th>
                    <th style={th}>{t.adminSubDates}</th>
                    <th style={th}>{t.adminToggle}</th>
                    <th style={th}>{t.adminDeleteCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const expiry = u.subscription_expires_at ? new Date(u.subscription_expires_at) : null;
                    const now = new Date();
                    const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                    const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                    const isExpired = daysLeft !== null && daysLeft <= 0;

                    return (
                      <tr key={u.id} style={{
                        opacity: saving === u.id ? 0.5 : 1,
                        background: isExpiringSoon ? "#fffbeb" : isExpired ? "#fef2f2" : undefined,
                      }}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: u.is_superadmin ? "#6366f1" : "#e5e7eb",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, color: u.is_superadmin ? "white" : "#555", flexShrink: 0,
                            }}>
                              {u.email[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{u.email}</div>
                              {u.is_superadmin && <div style={{ fontSize: 11, color: "#6366f1" }}>Superadmin</div>}
                            </div>
                          </div>
                        </td>
                        <td style={td}>{new Date(u.created_at).toLocaleDateString(locale)}</td>
                        <td style={td}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: u.is_active ? "#dcfce7" : "#fee2e2",
                            color: u.is_active ? "#16a34a" : "#dc2626",
                          }}>
                            {u.is_active ? t.adminActiveLabel : t.adminPassiveLabel}
                          </span>
                        </td>
                        <td style={td}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                            background: "#f3f4f6", color: "#374151",
                          }}>
                            {planLabels[u.plan ?? ""] ?? u.plan ?? "—"}
                          </span>
                        </td>
                        <td style={{ ...td, minWidth: 280 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 11, color: "#888", minWidth: 56 }}>{t.adminStart}</span>
                              <input
                                type="date"
                                value={editStart[u.id] ?? ""}
                                onChange={(e) => setEditStart((prev) => ({ ...prev, [u.id]: e.target.value }))}
                                style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, flex: 1 }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 11, color: "#888", minWidth: 56 }}>{t.adminEnd}</span>
                              <input
                                type="date"
                                value={editExpiry[u.id] ?? ""}
                                onChange={(e) => setEditExpiry((prev) => ({ ...prev, [u.id]: e.target.value }))}
                                style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, flex: 1 }}
                              />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <button
                                onClick={() => handleSetDates(u.id)}
                                disabled={saving === u.id}
                                style={{
                                  padding: "5px 10px", background: "#6366f1", color: "white",
                                  border: "none", borderRadius: 6, cursor: "pointer",
                                  fontSize: 12, fontWeight: 600, alignSelf: "flex-end",
                                }}
                              >
                                {t.save}
                              </button>
                              {isExpiringSoon && (
                                <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: "bold" }}>
                                  ⚠️ {daysLeft} gün
                                </span>
                              )}
                              {isExpired && (
                                <span style={{ fontSize: 11, color: "#ef4444", fontWeight: "bold" }}>
                                  🔴 Süresi doldu
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={td}>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={saving === u.id || u.is_superadmin}
                            style={{
                              padding: "6px 14px",
                              background: u.is_active ? "#fef9c3" : "#dcfce7",
                              color: u.is_active ? "#854d0e" : "#15803d",
                              border: "none", borderRadius: 8,
                              cursor: u.is_superadmin ? "not-allowed" : "pointer",
                              fontSize: 12, fontWeight: 600,
                              opacity: u.is_superadmin ? 0.4 : 1,
                            }}
                          >
                            {u.is_active ? t.adminMakePassive : t.adminMakeActive}
                          </button>
                        </td>
                        <td style={td}>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={saving === u.id || u.is_superadmin}
                            style={{
                              padding: "6px 14px",
                              background: "#fee2e2", color: "#dc2626",
                              border: "none", borderRadius: 8,
                              cursor: u.is_superadmin ? "not-allowed" : "pointer",
                              fontSize: 12, fontWeight: 600,
                              opacity: u.is_superadmin ? 0.4 : 1,
                            }}
                          >
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#aaa" }}>
                        {t.adminNoUsers}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
