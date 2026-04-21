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

export default function AdminPanel() {
  const { t, lang } = useLang();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<Record<string, string>>({});
  const [editExpiry, setEditExpiry] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("is_superadmin").eq("id", session.user.id).single();
      if (!profile?.is_superadmin) { router.replace("/"); return; }

      setToken(session.access_token);
      await fetchUsers(session.access_token);
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

  const apiPatch = async (id: string, body: object) => {
    if (!token) return;
    setSaving(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    await fetchUsers(token);
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
    await fetchUsers(token);
    setSaving(null);
  };

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const th = { padding: "10px 14px", textAlign: "left" as const, fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "2px solid #eee" };
  const td = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" as const };

  if (loading) return (
    <DashboardLayout>
      <p style={{ color: "#888" }}>{t.loading}</p>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>{t.adminTitle}</h1>
          <span style={{ background: "#6366f1", color: "white", borderRadius: 20, padding: "3px 14px", fontSize: 13, fontWeight: 600 }}>
            {users.length} {t.adminUsers}
          </span>
        </div>

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
                {users.map((u) => (
                  <tr key={u.id} style={{ opacity: saving === u.id ? 0.5 : 1 }}>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: u.is_superadmin ? "#6366f1" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: u.is_superadmin ? "white" : "#555", flexShrink: 0 }}>
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
                    <td style={td}>{u.plan ?? "-"}</td>
                    <td style={{ ...td, minWidth: 260 }}>
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
                        <button
                          onClick={() => handleSetDates(u.id)}
                          disabled={saving === u.id}
                          style={{ padding: "5px 10px", background: "#6366f1", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, alignSelf: "flex-end" }}
                        >
                          {t.save}
                        </button>
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
                          border: "none", borderRadius: 8, cursor: u.is_superadmin ? "not-allowed" : "pointer",
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
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#aaa" }}>{t.adminNoUsers}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
