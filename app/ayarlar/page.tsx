"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type Job = {
  id: string; operation: "backup" | "restore"; trigger: "manual" | "cron"; status: "running" | "success" | "failed";
  phase: string | null; progress: number; startedAt: string; finishedAt: string | null;
  fileName: string | null; fileSize: number | null; error: string | null; warnings: string[];
};
type Status = {
  configured: boolean; connected: boolean;
  connection: { email: string | null; status: "connected" | "error"; lastError: string | null } | null;
  drive: { reachable: boolean; usedBytes?: number; limitBytes?: number | null; folderUrl?: string; error?: string } | null;
  lastBackup: Job | null; running: Job | null; logs: Job[];
};
type BackupFile = { id: string; name: string; size: number; createdTime?: string; kind: "Daily" | "Monthly" | "Yearly" };

const COLOR = "#6366f1";
const card: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 };
const btn = (bg: string, disabled = false): React.CSSProperties => ({
  background: disabled ? "#d1d5db" : bg, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px",
  fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
});
const btnGhost: React.CSSProperties = { background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, padding: "9px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const td: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid #f3f4f6", fontSize: 13, textAlign: "left" };

const fmtSize = (b?: number | null) => {
  if (!b) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, v = b;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};
const fmtDate = (s?: string | null) => s ? new Date(s).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const PHASES: Record<string, string> = {
  json: "Veritabanı JSON'a aktarılıyor", excel: "Excel dosyaları hazırlanıyor", documents: "Belgeler yedekleniyor", finalize: "Arşivleniyor",
  init: "Yedek doğrulanıyor", purge: "Mevcut veri temizleniyor", import: "Veriler geri yükleniyor", reconcile: "Stoklar doğrulanıyor", done: "Tamamlandı",
};
const DRIVE_MSG: Record<string, string> = {
  connected: "Google Drive başarıyla bağlandı.", denied: "Google izni verilmedi.", invalid: "Bağlantı isteği geçersiz veya süresi doldu. Tekrar deneyin.",
  norefresh: "Google kalıcı erişim vermedi. Hesabınızın izinlerinden StokPanel'i kaldırıp tekrar bağlayın.",
  scope: "Drive erişim izni verilmedi. Bağlarken tüm izin kutularını işaretleyin.", error: "Google bağlantısı kurulamadı.",
};

export default function Ayarlar() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [active, setActive] = useState<Job | null>(null);
  const [showList, setShowList] = useState(false);
  const [files, setFiles] = useState<BackupFile[] | null>(null);
  const [selected, setSelected] = useState<BackupFile | null>(null);
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [confirm, setConfirm] = useState("");
  const running = useRef(false);

  const api = useCallback(async (path: string, init?: RequestInit, tok = token) => {
    const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}`, ...(init?.headers ?? {}) } });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  }, [token]);

  const refresh = useCallback(async (tok = token) => {
    if (!tok) return;
    const r = await api("/api/backup/status", undefined, tok);
    if (r.ok) { setStatus(r.json); if (r.json.running) setActive(r.json.running); }
  }, [api, token]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setToken(session.access_token);
      const code = new URLSearchParams(window.location.search).get("drive");
      if (code) {
        setMsg({ type: code === "connected" ? "ok" : "err", text: DRIVE_MSG[code] ?? "Bilinmeyen sonuç" });
        window.history.replaceState({}, "", "/ayarlar");
      }
      const r = await fetch("/api/backup/status", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (r.ok) { const j = await r.json(); setStatus(j); if (j.running) setActive(j.running); }
      setLoading(false);
    })();
  }, []);

  // Çalışan işi (yedek / geri yükleme) bitene dek sürdürür: her çağrı sunucuda ≤ ~4 dk iş yapar.
  const drive = useCallback(async (path: string, body?: object) => {
    if (running.current) return;
    running.current = true;
    try {
      let first = true;
      for (;;) {
        const r = await api(path, { method: "POST", body: first && body ? JSON.stringify(body) : undefined });
        first = false;
        if (!r.ok) { setMsg({ type: "err", text: r.json.error ?? "İşlem başarısız" }); break; }
        setActive(r.json.job);
        if (r.json.done) {
          const j: Job = r.json.job;
          setMsg(j.status === "success"
            ? { type: "ok", text: j.operation === "backup" ? "Yedekleme tamamlandı." : "Geri yükleme tamamlandı. Sayfayı yenileyerek güncel veriyi görebilirsiniz." }
            : { type: "err", text: j.error ?? "İşlem başarısız" });
          break;
        }
        if (r.json.busy) await new Promise((res) => setTimeout(res, 4000)); // başka bir istek/cron yürütüyor
      }
    } catch (e) {
      setMsg({ type: "err", text: `Bağlantı hatası: ${(e as Error).message}. Sayfayı yenileyin; iş sunucuda devam eder.` });
    } finally {
      running.current = false;
      await refresh();
    }
  }, [api, refresh]);

  // Sayfa açıldığında devam eden bir iş varsa takibe devam et.
  useEffect(() => {
    if (status?.running && !running.current && token) {
      drive(status.running.operation === "backup" ? "/api/backup/run" : "/api/backup/restore");
    }
  }, [status?.running, token, drive]);

  const connect = async () => {
    const r = await api("/api/backup/google/connect");
    if (r.ok) window.location.href = r.json.url;
    else setMsg({ type: "err", text: r.json.error ?? "Bağlantı başlatılamadı" });
  };
  const disconnect = async () => {
    if (!window.confirm("Google Drive bağlantısı kesilsin mi? Drive'daki yedekleriniz silinmez ancak otomatik yedekleme durur.")) return;
    const r = await api("/api/backup/google/disconnect", { method: "POST" });
    setMsg(r.ok ? { type: "ok", text: "Bağlantı kesildi." } : { type: "err", text: r.json.error });
    setFiles(null); setShowList(false);
    await refresh();
  };
  const loadFiles = async () => {
    setShowList(true);
    setFiles(null);
    const r = await api("/api/backup/list");
    if (r.ok) setFiles(r.json.files);
    else { setMsg({ type: "err", text: r.json.error ?? "Yedekler listelenemedi" }); setFiles([]); }
  };
  const restore = async () => {
    if (!selected) return;
    setMsg(null);
    await drive("/api/backup/restore", { fileId: selected.id, mode, confirm });
    setSelected(null); setConfirm("");
  };

  const busy = Boolean(active && active.status === "running");
  const connOk = status?.connected && status.connection?.status === "connected";

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 920 }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 6 }}>⚙️ Ayarlar</h1>
        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>Verileriniz her gece 00:00&apos;da Google Drive hesabınıza yedeklenir.</p>

        {msg && (
          <div role="status" style={{ background: msg.type === "ok" ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.type === "ok" ? "#a7f3d0" : "#fecaca"}`, color: msg.type === "ok" ? "#065f46" : "#b91c1c", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>
            {msg.text}
          </div>
        )}

        <section style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>☁️ Google Drive Entegrasyonu</h2>
          {loading ? <p>Yükleniyor…</p> : !status ? <p>Durum alınamadı. Oturumunuzu kontrol edin.</p> : (
            <>
              {!status.configured && (
                <p style={{ color: "#b45309", fontSize: 14, marginBottom: 12 }}>Google entegrasyonu sunucuda henüz yapılandırılmamış (yönetici: .env.example dosyasındaki Google/BACKUP değişkenleri).</p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 16 }}>
                <Info label="Bağlı Google Hesabı" value={status.connection?.email ?? (status.connected ? "—" : "Bağlı değil")} />
                <Info label="Son Yedek Tarihi" value={fmtDate(status.lastBackup?.finishedAt)} />
                <Info label="Son Yedek Boyutu" value={fmtSize(status.lastBackup?.fileSize)} />
                <Info
                  label="Drive Durumu"
                  value={!status.connected ? "Bağlı değil" : status.drive?.reachable ? `Bağlı · ${fmtSize(status.drive.usedBytes)} kullanılıyor` : "Erişilemiyor — yeniden bağlayın"}
                  color={!status.connected ? "#6b7280" : status.drive?.reachable ? "#059669" : "#dc2626"}
                />
              </div>
              {status.connection?.status === "error" && (
                <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>Bağlantı hatası: {status.connection.lastError}. Otomatik yedekleme durdu; Google hesabını yeniden bağlayın.</p>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={btn(COLOR, !status.configured || busy)} disabled={!status.configured || busy} onClick={connect}>
                  {status.connected ? "Google Hesabını Yeniden Bağla" : "Google Hesabını Bağla"}
                </button>
                <button style={btn("#059669", !connOk || busy)} disabled={!connOk || busy} onClick={() => { setMsg(null); drive("/api/backup/run"); }}>
                  Şimdi Yedek Al
                </button>
                <button
                  style={{ ...btnGhost, opacity: status.drive?.folderUrl ? 1 : 0.5 }} disabled={!status.drive?.folderUrl}
                  onClick={() => window.open(status.drive!.folderUrl, "_blank", "noopener,noreferrer")}
                >
                  Google Drive&apos;ı Aç
                </button>
                <button style={{ ...btnGhost, opacity: connOk ? 1 : 0.5 }} disabled={!connOk} onClick={loadFiles}>Yedekleri Gör</button>
                <button style={{ ...btnGhost, opacity: connOk && !busy ? 1 : 0.5 }} disabled={!connOk || busy} onClick={loadFiles}>Geri Yükle</button>
                {status.connected && <button style={{ ...btnGhost, color: "#dc2626" }} disabled={busy} onClick={disconnect}>Bağlantıyı Kes</button>}
              </div>

              {active && (busy || active.status === "failed") && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, marginBottom: 6, color: "#374151" }}>
                    {active.operation === "backup" ? "Yedekleme" : "Geri yükleme"}: {PHASES[active.phase ?? ""] ?? active.phase} — %{active.progress}
                  </div>
                  <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${active.progress}%`, height: "100%", background: COLOR, transition: "width .4s" }} />
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Büyük veritabanlarında işlem birkaç dakika sürebilir; bu sayfayı kapatsanız da sunucu tarafında devam eder.</p>
                </div>
              )}
              {active?.warnings?.length ? (
                <ul style={{ marginTop: 12, fontSize: 12, color: "#b45309", paddingLeft: 18 }}>
                  {active.warnings.slice(0, 8).map((w) => <li key={w}>{w}</li>)}
                </ul>
              ) : null}
            </>
          )}
        </section>

        {showList && (
          <section style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🗂️ Drive&apos;daki Yedekler</h2>
            {files === null ? <p>Yükleniyor…</p> : files.length === 0 ? <p style={{ fontSize: 14, color: "#6b7280" }}>Henüz yedek yok.</p> : (
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><th style={td}>Dosya</th><th style={td}>Tür</th><th style={td}>Boyut</th><th style={td}>Oluşturulma</th><th style={td} /></tr></thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.id} style={{ background: selected?.id === f.id ? "#eef2ff" : undefined }}>
                        <td style={td}>{f.name}</td>
                        <td style={td}>{f.kind === "Daily" ? "Günlük" : f.kind === "Monthly" ? "Aylık" : "Yıllık"}</td>
                        <td style={td}>{fmtSize(f.size)}</td>
                        <td style={td}>{fmtDate(f.createdTime)}</td>
                        <td style={td}><button style={{ ...btnGhost, padding: "4px 10px", fontSize: 12 }} disabled={busy} onClick={() => { setSelected(f); setConfirm(""); }}>Seç</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selected && (
              <div style={{ marginTop: 16, padding: 16, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Geri yüklenecek yedek: {selected.name}</div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  <input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} /> <b>Tam geri yükleme</b> — mevcut ürün/stok/cari/satış verisi silinir, yedekteki haline döner
                </label>
                <label style={{ display: "block", fontSize: 13, marginBottom: 10 }}>
                  <input type="radio" checked={mode === "merge"} onChange={() => setMode("merge")} /> <b>Birleştir</b> — mevcut veri silinmez; yedekteki kayıtlar eklenir/güncellenir
                </label>
                <p style={{ fontSize: 12, color: "#7f1d1d", marginBottom: 8 }}>
                  Tam geri yüklemeden önce son 1 saat içinde bir yedek alınmış olmalıdır. Onaylamak için <b>GERİ YÜKLE</b> yazın.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="GERİ YÜKLE" style={{ padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }} />
                  <button style={btn("#dc2626", busy || confirm.trim().toLocaleUpperCase("tr-TR") !== "GERİ YÜKLE")} disabled={busy || confirm.trim().toLocaleUpperCase("tr-TR") !== "GERİ YÜKLE"} onClick={restore}>
                    Geri Yüklemeyi Başlat
                  </button>
                  <button style={btnGhost} onClick={() => setSelected(null)}>Vazgeç</button>
                </div>
              </div>
            )}
          </section>
        )}

        <section style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📋 Yedekleme Geçmişi</h2>
          {!status?.logs.length ? <p style={{ fontSize: 14, color: "#6b7280" }}>Henüz kayıt yok.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={td}>İşlem</th><th style={td}>Başlangıç</th><th style={td}>Bitiş</th><th style={td}>Dosya</th><th style={td}>Boyut</th><th style={td}>Durum</th></tr></thead>
                <tbody>
                  {status.logs.map((l) => (
                    <tr key={l.id}>
                      <td style={td}>{l.operation === "backup" ? (l.trigger === "cron" ? "Gece yedeği" : "Manuel yedek") : "Geri yükleme"}</td>
                      <td style={td}>{fmtDate(l.startedAt)}</td>
                      <td style={td}>{fmtDate(l.finishedAt)}</td>
                      <td style={td}>{l.fileName ?? "—"}</td>
                      <td style={td}>{fmtSize(l.fileSize)}</td>
                      <td style={{ ...td, color: l.status === "success" ? "#059669" : l.status === "failed" ? "#dc2626" : "#d97706", fontWeight: 600 }} title={l.error ?? ""}>
                        {l.status === "success" ? "Başarılı" : l.status === "failed" ? `Başarısız${l.error ? `: ${l.error.slice(0, 80)}` : ""}` : "Sürüyor"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function Info({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: color ?? "#111827", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
