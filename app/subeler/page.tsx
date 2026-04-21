"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

type BranchStats = {
  stok: number;
  satis: number;
  alis: number;
};

export default function SubelerPage() {
  const { t, lang } = useLang();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<Record<string, BranchStats>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("tenant_id, plan").eq("id", user.id).single();
      if (profile?.plan !== "profesyonel") {
        setIsPro(false);
        setLoading(false);
        setTimeout(() => router.push("/abonelik"), 3000);
        return;
      }
      setIsPro(true);
      if (profile?.tenant_id) {
        setTenantId(profile.tenant_id);
        await fetchBranches(profile.tenant_id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const fetchBranches = async (tid: string) => {
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("tenant_id", tid)
      .order("created_at", { ascending: true });
    const list = data ?? [];
    setBranches(list);
    await fetchStats(list);
  };

  const fetchStats = async (list: Branch[]) => {
    const statsMap: Record<string, BranchStats> = {};
    await Promise.all(
      list.map(async (b) => {
        const [{ count: stok }, { data: satisData }, { data: alisData }] = await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }).eq("branch_id", b.id),
          supabase.from("sales").select("total").eq("branch_id", b.id),
          supabase.from("purchases").select("total_price").eq("branch_id", b.id),
        ]);
        statsMap[b.id] = {
          stok: stok ?? 0,
          satis: (satisData ?? []).reduce((s: number, r: any) => s + (r.total ?? 0), 0),
          alis: (alisData ?? []).reduce((s: number, r: any) => s + (r.total_price ?? 0), 0),
        };
      })
    );
    setStats(statsMap);
  };

  const openAdd = () => {
    setEditBranch(null);
    setForm({ name: "", address: "", phone: "" });
    setShowForm(true);
  };

  const openEdit = (b: Branch) => {
    setEditBranch(b);
    setForm({ name: b.name, address: b.address ?? "", phone: b.phone ?? "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !tenantId) return;
    setSaving(true);
    if (editBranch) {
      await supabase.from("branches").update({
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
      }).eq("id", editBranch.id);
    } else {
      await supabase.from("branches").insert({
        tenant_id: tenantId,
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
      });
    }
    await fetchBranches(tenantId);
    setShowForm(false);
    setSaving(false);
  };

  const handleToggleActive = async (b: Branch) => {
    if (!tenantId) return;
    await supabase.from("branches").update({ is_active: !b.is_active }).eq("id", b.id);
    await fetchBranches(tenantId);
  };

  const handleDelete = async (b: Branch) => {
    if (!tenantId) return;
    if (!confirm(`"${b.name}" ${t.deleteConfirmBranch}`)) return;
    await supabase.from("branches").delete().eq("id", b.id);
    await fetchBranches(tenantId);
  };

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const fmt = (n: number) => n.toLocaleString(locale, { minimumFractionDigits: 2 });

  const th = { padding: "10px 14px", textAlign: "left" as const, fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "2px solid #eee" };
  const td = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" as const };

  if (loading) return (
    <DashboardLayout>
      <p style={{ color: "#888" }}>{t.loading}</p>
    </DashboardLayout>
  );

  if (isPro === false) return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16, textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#1e1b4b" }}>{t.proRequired}</h2>
        <p style={{ color: "#888", maxWidth: 360 }}>{t.proRequiredDesc}</p>
        <button
          onClick={() => router.push("/abonelik")}
          style={{ padding: "10px 24px", background: "#10b981", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          {t.goToSubscription}
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: "bold" }}>{t.subelerTitle}</h1>
            <span style={{ background: "#6366f1", color: "white", borderRadius: 20, padding: "3px 14px", fontSize: 13, fontWeight: 600 }}>
              {branches.length} {t.branchesCount}
            </span>
          </div>
          <button
            onClick={openAdd}
            style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            {t.newBranch}
          </button>
        </div>

        {showForm && (
          <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{editBranch ? t.editBranchForm : t.newBranchForm}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
              <input
                placeholder={t.branchName}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
              />
              <input
                placeholder={t.address}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
              />
              <input
                placeholder={t.phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex: 1, padding: "10px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                >
                  {saving ? t.saving : t.save}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "10px", background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={th}>{t.branchName.replace(" *", "")}</th>
                  <th style={th}>{t.address}</th>
                  <th style={th}>{t.phone}</th>
                  <th style={th}>{t.statusLabel}</th>
                  <th style={th}>{t.stockItems}</th>
                  <th style={th}>{t.totalSalesCol}</th>
                  <th style={th}>{t.totalPurchasesCol}</th>
                  <th style={th}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id}>
                    <td style={td}><strong>{b.name}</strong></td>
                    <td style={td}>{b.address ?? "-"}</td>
                    <td style={td}>{b.phone ?? "-"}</td>
                    <td style={td}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: b.is_active ? "#dcfce7" : "#fee2e2",
                        color: b.is_active ? "#16a34a" : "#dc2626",
                      }}>
                        {b.is_active ? t.activeStatus : t.passiveStatus}
                      </span>
                    </td>
                    <td style={td}>{stats[b.id]?.stok ?? "-"}</td>
                    <td style={td}>{stats[b.id] !== undefined ? fmt(stats[b.id].satis) + " TL" : "-"}</td>
                    <td style={td}>{stats[b.id] !== undefined ? fmt(stats[b.id].alis) + " TL" : "-"}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(b)}
                          style={{ padding: "5px 12px", background: "#eff6ff", color: "#3b82f6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => handleToggleActive(b)}
                          style={{ padding: "5px 12px", background: b.is_active ? "#fef9c3" : "#dcfce7", color: b.is_active ? "#854d0e" : "#15803d", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          {b.is_active ? t.makePassive : t.makeActive}
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>
                      {t.noBranches}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
