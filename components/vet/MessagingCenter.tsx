"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type PendingVaccine = {
  id: string;
  pet_name: string;
  owner_name: string;
  owner_phone: string;
  vaccine_name: string;
  next_due_date: string;
  daysLeft: number;
  logId?: string; // set after message is logged
};

type MessageLog = {
  id: string;
  pet_name: string;
  owner_name: string;
  owner_phone: string;
  message_type: string;
  sent_at: string;
  status: string;
};

type Template = {
  id: string;
  name: string;
  body: string;
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "vaccine_reminder",
    name: "Aşı Hatırlatma",
    body: "Sayın {owner_name},\n\n{pet_name} adlı hayvanınızın *{vaccine_name}* aşı tarihi {due_date} olarak yaklaşmaktadır.\n\nRandevu almak için kliniğimizi arayabilirsiniz. 📞\n\nSağlıklı günler dileriz 🐾",
  },
  {
    id: "overdue_vaccine",
    name: "Gecikmiş Aşı",
    body: "Sayın {owner_name},\n\n{pet_name} adlı hayvanınızın *{vaccine_name}* aşısı {due_date} tarihinde yapılması gerekiyordu.\n\nLütfen en kısa sürede kliniğimizi arayarak randevu alınız. ⚠️",
  },
  {
    id: "appointment_reminder",
    name: "Randevu Hatırlatma",
    body: "Sayın {owner_name},\n\n{pet_name} adlı hayvanınız için yarın randevunuz bulunmaktadır.\n\nBekliyoruz 🏥",
  },
];

function buildMessage(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (msg, [k, v]) => msg.replaceAll(`{${k}}`, v),
    template
  );
}

function cleanPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return "90" + d.slice(1);
  if (d.startsWith("90")) return d;
  return "90" + d;
}

export default function MessagingCenter() {
  const [pending, setPending] = useState<PendingVaccine[]>([]);
  const [log, setLog] = useState<MessageLog[]>([]);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0]);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [draftBody, setDraftBody] = useState(DEFAULT_TEMPLATES[0].body);
  const [filterDays, setFilterDays] = useState<number>(7);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappApiKey, setWhatsappApiKey] = useState("");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [autoSending, setAutoSending] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    const tid = profile?.tenant_id;
    if (!tid) return;
    setTenantId(tid);

    const today = new Date().toISOString().split("T")[0];
    const limit = new Date(Date.now() + filterDays * 86400000).toISOString().split("T")[0];

    const overdue = new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0];

    const [vRes, logRes] = await Promise.all([
      supabase.from("vet_vaccines")
        .select("id,pet_name,owner_name,owner_phone,vaccine_name,next_due_date")
        .eq("tenant_id", tid)
        .gte("next_due_date", overdue)
        .lte("next_due_date", limit)
        .order("next_due_date"),
      supabase.from("vet_message_log")
        .select("id,pet_name,owner_name,owner_phone,message_type,sent_at,status")
        .eq("tenant_id", tid)
        .order("sent_at", { ascending: false })
        .limit(50),
    ]);

    const vaccines: PendingVaccine[] = (vRes.data ?? []).map((v) => ({
      ...v,
      daysLeft: Math.ceil((new Date(v.next_due_date).getTime() - Date.now()) / 86400000),
    }));

    setPending(vaccines);
    setLog((logRes.data ?? []) as MessageLog[]);
    setLoading(false);
  }, [filterDays]);

  useEffect(() => { load(); }, [load]);

  const logMessage = async (vaccine: PendingVaccine, message: string) => {
    if (!tenantId) return;
    await supabase.from("vet_message_log").insert({
      tenant_id: tenantId,
      vaccine_id: vaccine.id,
      pet_name: vaccine.pet_name,
      owner_name: vaccine.owner_name,
      owner_phone: vaccine.owner_phone,
      message_type: selectedTemplate.name,
      message_body: message,
      status: "gönderildi",
      sent_at: new Date().toISOString(),
    });
    setSentIds((prev) => new Set([...prev, vaccine.id]));
  };

  const sendOne = async (vaccine: PendingVaccine) => {
    if (!vaccine.owner_phone) { alert("Bu hasta için telefon numarası yok."); return; }
    const message = buildMessage(selectedTemplate.body, {
      owner_name: vaccine.owner_name,
      pet_name: vaccine.pet_name,
      vaccine_name: vaccine.vaccine_name,
      due_date: vaccine.next_due_date,
    });
    const num = cleanPhone(vaccine.owner_phone);
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
    await logMessage(vaccine, message);
  };

  const sendAll = async () => {
    const unsent = pending.filter((v) => v.owner_phone && !sentIds.has(v.id));
    if (unsent.length === 0) { alert("Gönderilecek mesaj yok."); return; }
    setSending(true);
    for (let i = 0; i < unsent.length; i++) {
      const v = unsent[i];
      const message = buildMessage(selectedTemplate.body, {
        owner_name: v.owner_name,
        pet_name: v.pet_name,
        vaccine_name: v.vaccine_name,
        due_date: v.next_due_date,
      });
      const num = cleanPhone(v.owner_phone);
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
      await logMessage(v, message);
      if (i < unsent.length - 1) await new Promise((r) => setTimeout(r, 1200));
    }
    setSending(false);
    await load();
  };

  const triggerEdgeFunction = async () => {
    setAutoSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("vet-reminders", {
        body: { tenant_id: tenantId, days_ahead: filterDays, api_key: whatsappApiKey },
      });
      if (error) throw error;
      alert(`Otomatik gönderim tamamlandı. ${data?.sent ?? 0} mesaj gönderildi.`);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Edge Function hatası: ${msg}`);
    } finally {
      setAutoSending(false);
    }
  };

  const unsentCount = pending.filter((v) => v.owner_phone && !sentIds.has(v.id)).length;
  const overdueCount = pending.filter((v) => v.daysLeft < 0).length;

  const inp: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold" }}>💬 Mesaj Merkezi</h1>
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            style={{ padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#555" }}
          >
            ⚙️ Otomatik Gönderim Ayarları
          </button>
        </div>

        {/* Auto-send settings panel */}
        {showApiSettings && (
          <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>🤖 Otomatik Gönderim (WhatsApp Cloud API)</h2>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 14, lineHeight: 1.6 }}>
              WhatsApp Cloud API anahtarınızı girerek Supabase Edge Function üzerinden otomatik mesaj gönderimi yapabilirsiniz.
              Edge Function sabah 09:00'da otomatik tetiklenmesi için Supabase&apos;de pg_cron kurulumu yapmanız gerekir.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 12 }}>
              <input
                style={inp}
                type="password"
                placeholder="WhatsApp Cloud API Token (Bearer ...)"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
              />
              <button
                onClick={triggerEdgeFunction}
                disabled={autoSending || !whatsappApiKey}
                style={{ padding: "8px 20px", background: autoSending || !whatsappApiKey ? "#e5e7eb" : "#25d366", color: autoSending || !whatsappApiKey ? "#aaa" : "white", border: "none", borderRadius: 8, cursor: autoSending || !whatsappApiKey ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}
              >
                {autoSending ? "Gönderiliyor..." : "🚀 Şimdi Çalıştır"}
              </button>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 6 }}>Supabase&apos;de otomatik zamanlama için (pg_cron):</p>
              <pre style={{ fontSize: 11, color: "#374151", margin: 0, overflowX: "auto" }}>
{`SELECT cron.schedule(
  'vet-daily-reminders',
  '0 9 * * *',
  $$SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/vet-reminders',
    headers := '{"Authorization":"Bearer <anon-key>"}',
    body := '{"days_ahead":7}'
  )$$
);`}
              </pre>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <StatCard label="Bekleyen Hatırlatma" value={unsentCount} color="#f59e0b" icon="📨" />
          <StatCard label="Gecikmiş Aşı" value={overdueCount} color="#ef4444" icon="⚠️" />
          <StatCard label="Bugün Gönderilen" value={sentIds.size} color="#10b981" icon="✅" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Left: Pending list */}
          <div>
            {/* Filters + template */}
            <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {[3, 7, 14, 30].map((d) => (
                  <button key={d} onClick={() => setFilterDays(d)} style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filterDays === d ? "#f59e0b" : "#f3f4f6", color: filterDays === d ? "white" : "#555" }}>
                    {d} Gün
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Mesaj Şablonu</label>
                <select
                  style={inp}
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const t = templates.find((t) => t.id === e.target.value)!;
                    setSelectedTemplate(t);
                    setDraftBody(t.body);
                  }}
                >
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <button onClick={() => setEditingTemplate(!editingTemplate)} style={{ fontSize: 12, color: "#0ea5e9", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {editingTemplate ? "Şablonu kapat" : "✏️ Şablonu düzenle"}
              </button>

              {editingTemplate && (
                <div style={{ marginTop: 10 }}>
                  <textarea
                    style={{ ...inp, height: 120, resize: "vertical", fontFamily: "monospace" }}
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                  />
                  <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Değişkenler: {"{owner_name}"} {"{pet_name}"} {"{vaccine_name}"} {"{due_date}"}</p>
                  <button
                    onClick={() => {
                      const updated = templates.map((t) => t.id === selectedTemplate.id ? { ...t, body: draftBody } : t);
                      setTemplates(updated);
                      setSelectedTemplate({ ...selectedTemplate, body: draftBody });
                      setEditingTemplate(false);
                    }}
                    style={{ marginTop: 6, padding: "6px 16px", background: "#8b5cf6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    Kaydet
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Bekleyen Listesi ({pending.length})</span>
              <button
                onClick={sendAll}
                disabled={sending || unsentCount === 0}
                style={{ padding: "8px 18px", background: sending || unsentCount === 0 ? "#e5e7eb" : "#25d366", color: sending || unsentCount === 0 ? "#aaa" : "white", border: "none", borderRadius: 8, cursor: sending || unsentCount === 0 ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 13 }}
              >
                {sending ? "Gönderiliyor..." : `💬 Tümüne Gönder (${unsentCount})`}
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 32, color: "#888" }}>Yükleniyor...</div>
            ) : pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, background: "white", borderRadius: 12, color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ margin: 0, fontWeight: 600 }}>Bu aralıkta bekleyen hatırlatma yok.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending.map((v) => {
                  const sent = sentIds.has(v.id);
                  const overdue = v.daysLeft < 0;
                  return (
                    <div key={v.id} style={{ background: "white", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${sent ? "#bbf7d0" : overdue ? "#fecaca" : "#fde68a"}`, opacity: sent ? 0.65 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", fontSize: 14 }}>
                            {v.pet_name}
                            <span style={{ fontWeight: "normal", color: "#888", fontSize: 12, marginLeft: 6 }}>{v.vaccine_name}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>👤 {v.owner_name}</div>
                          <div style={{ fontSize: 12, color: "#888" }}>📞 {v.owner_phone || "Telefon yok"}</div>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: overdue ? "#ef4444" : "#d97706", fontWeight: "bold" }}>
                            {overdue ? `${Math.abs(v.daysLeft)} gün gecikti` : `${v.daysLeft} gün kaldı`}
                          </div>
                          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{v.next_due_date}</div>
                          {sent ? (
                            <span style={{ fontSize: 11, fontWeight: "bold", color: "#10b981" }}>✓ Gönderildi</span>
                          ) : (
                            <button
                              onClick={() => sendOne(v)}
                              disabled={!v.owner_phone}
                              style={{ padding: "5px 12px", background: v.owner_phone ? "#25d366" : "#e5e7eb", color: v.owner_phone ? "white" : "#aaa", border: "none", borderRadius: 6, cursor: v.owner_phone ? "pointer" : "not-allowed", fontSize: 11, fontWeight: "bold" }}
                            >
                              💬 Gönder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Message log */}
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>📋 Gönderim Geçmişi</h2>
              <button onClick={load} style={{ fontSize: 12, color: "#0ea5e9", background: "none", border: "none", cursor: "pointer" }}>Yenile</button>
            </div>
            {log.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#9ca3af", fontSize: 13 }}>Henüz gönderim yok.</div>
            ) : (
              <div style={{ overflowY: "auto", maxHeight: 520 }}>
                {log.map((l) => (
                  <div key={l.id} style={{ padding: "12px 18px", borderBottom: "1px solid #f9fafb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{l.pet_name}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#f0fdf4", color: "#10b981", fontWeight: "bold" }}>{l.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>👤 {l.owner_name} · 📞 {l.owner_phone}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{l.message_type} · {new Date(l.sent_at).toLocaleString("tr-TR")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
    </div>
  );
}
