import { supabaseAdmin, verifyAdmin } from "@/lib/supabase-admin";

const FEATURE_LABELS: Record<string, string> = {
  "/stok": "Stok",
  "/cari": "Cari",
  "/satislar": "Satışlar",
  "/alislar": "Alışlar",
  "/yeni-satis": "Yeni Satış",
  "/raporlar": "Raporlar",
};
const TOTAL_FEATURES = Object.keys(FEATURE_LABELS).length;
// Ciro ile doğrudan ilişkili sayfalar — "satın alma ihtimali" bunlara göre hesaplanır.
const CORE_ACTION_LABELS = ["Satışlar", "Yeni Satış", "Alışlar", "Cari"];

type UsageSummary = {
  features: string[];
  featureCounts: Record<string, number>;
  todayMinutes: number;
  totalMinutes: number;
  retentionScore: number;
  purchaseLikelihood: number;
  status: "ok" | "needs_help";
  firstSeenAt: string | null;
  mostActiveDay: string | null;
  milestones: {
    firstLogin: boolean;
    demoStarted: boolean;
    tookAction: boolean;
  };
};

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  const { data: events, error } = await supabaseAdmin
    .from("usage_events")
    .select("user_id, event_type, path, created_at");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const todayStr = new Date().toISOString().slice(0, 10);

  const byUser = new Map<string, {
    featureCounts: Map<string, number>;
    heartbeats: number;
    heartbeatsByDay: Map<string, number>;
    firstSeenAt: string | null;
    dayCounts: Map<string, number>;
  }>();

  for (const e of events ?? []) {
    let entry = byUser.get(e.user_id);
    if (!entry) {
      entry = { featureCounts: new Map(), heartbeats: 0, heartbeatsByDay: new Map(), firstSeenAt: null, dayCounts: new Map() };
      byUser.set(e.user_id, entry);
    }
    if (!entry.firstSeenAt || e.created_at < entry.firstSeenAt) entry.firstSeenAt = e.created_at;
    const day = e.created_at.slice(0, 10);
    entry.dayCounts.set(day, (entry.dayCounts.get(day) ?? 0) + 1);

    if (e.event_type === "pageview" && e.path) {
      const label = FEATURE_LABELS[e.path];
      if (label) entry.featureCounts.set(label, (entry.featureCounts.get(label) ?? 0) + 1);
    }
    if (e.event_type === "heartbeat") {
      entry.heartbeats += 1;
      entry.heartbeatsByDay.set(day, (entry.heartbeatsByDay.get(day) ?? 0) + 1);
    }
  }

  const result: Record<string, UsageSummary> = {};
  for (const [userId, entry] of byUser) {
    const featureCounts = Object.fromEntries(entry.featureCounts);
    const features = Object.keys(featureCounts);
    const totalMinutes = entry.heartbeats;
    const todayMinutes = entry.heartbeatsByDay.get(todayStr) ?? 0;

    const retentionScore = Math.max(0, Math.min(5, Math.round(
      (features.length / TOTAL_FEATURES) * 3 + (Math.min(totalMinutes, 60) / 60) * 2
    )));

    const usedCore = CORE_ACTION_LABELS.filter((label) => (featureCounts[label] ?? 0) > 0).length;
    const purchaseLikelihood = Math.max(0, Math.min(5, Math.round((usedCore / CORE_ACTION_LABELS.length) * 5)));

    let mostActiveDay: string | null = null;
    let maxDayCount = 0;
    for (const [day, count] of entry.dayCounts) {
      if (count > maxDayCount) { maxDayCount = count; mostActiveDay = day; }
    }

    result[userId] = {
      features,
      featureCounts,
      todayMinutes,
      totalMinutes,
      retentionScore,
      purchaseLikelihood,
      status: retentionScore >= 3 ? "ok" : "needs_help",
      firstSeenAt: entry.firstSeenAt,
      mostActiveDay,
      milestones: {
        firstLogin: features.length > 0 || totalMinutes > 0,
        demoStarted: totalMinutes >= 5,
        tookAction: usedCore > 0,
      },
    };
  }

  return Response.json(result);
}
