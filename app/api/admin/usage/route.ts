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

type UsageSummary = {
  features: string[];
  activeMinutes: number;
  score: number;
  status: "ok" | "needs_help";
};

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  const { data: events, error } = await supabaseAdmin
    .from("usage_events")
    .select("user_id, event_type, path");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const byUser = new Map<string, { paths: Set<string>; heartbeats: number }>();
  for (const e of events ?? []) {
    let entry = byUser.get(e.user_id);
    if (!entry) {
      entry = { paths: new Set(), heartbeats: 0 };
      byUser.set(e.user_id, entry);
    }
    if (e.event_type === "pageview" && e.path) entry.paths.add(e.path);
    if (e.event_type === "heartbeat") entry.heartbeats += 1;
  }

  const result: Record<string, UsageSummary> = {};
  for (const [userId, entry] of byUser) {
    const features = [...entry.paths]
      .map((p) => FEATURE_LABELS[p])
      .filter((label): label is string => Boolean(label));
    const activeMinutes = entry.heartbeats;
    const score = Math.max(0, Math.min(5, Math.round(
      (features.length / TOTAL_FEATURES) * 3 + (Math.min(activeMinutes, 60) / 60) * 2
    )));
    result[userId] = {
      features,
      activeMinutes,
      score,
      status: score >= 3 ? "ok" : "needs_help",
    };
  }

  return Response.json(result);
}
