// Supabase Edge Function — Veteriner Aşı Hatırlatma
// Deploy: supabase functions deploy vet-reminders
// Otomatik çalıştırma için Supabase Dashboard > Database > pg_cron:
//
// SELECT cron.schedule(
//   'vet-daily-reminders',
//   '0 9 * * *',   -- her gün saat 09:00
//   $$
//   SELECT net.http_post(
//     url := 'https://<project-ref>.supabase.co/functions/v1/vet-reminders',
//     headers := '{"Authorization":"Bearer <service-role-key>","Content-Type":"application/json"}',
//     body := '{"days_ahead":7}'
//   )
//   $$
// );

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WA_API_URL = "https://graph.facebook.com/v19.0";

interface VaccineRow {
  id: string;
  tenant_id: string;
  pet_name: string;
  owner_name: string;
  owner_phone: string;
  vaccine_name: string;
  next_due_date: string;
}

async function sendWhatsAppCloudAPI(
  phone: string,
  message: string,
  apiToken: string,
  phoneNumberId: string
): Promise<boolean> {
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "90" + clean.slice(1) : clean.startsWith("90") ? clean : "90" + clean;

  const res = await fetch(`${WA_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: num,
      type: "text",
      text: { body: message },
    }),
  });

  return res.ok;
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let body: { days_ahead?: number; api_key?: string; phone_number_id?: string; tenant_id?: string } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const daysAhead = body.days_ahead ?? 7;
  const apiToken = body.api_key ?? Deno.env.get("WHATSAPP_API_TOKEN") ?? "";
  const phoneNumberId = body.phone_number_id ?? Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";

  const today = new Date().toISOString().split("T")[0];
  const limit = new Date(Date.now() + daysAhead * 86400000).toISOString().split("T")[0];

  // Build query — optionally filter by tenant
  let query = supabase
    .from("vet_vaccines")
    .select("id,tenant_id,pet_name,owner_name,owner_phone,vaccine_name,next_due_date")
    .gte("next_due_date", today)
    .lte("next_due_date", limit)
    .not("owner_phone", "is", null);

  if (body.tenant_id) query = query.eq("tenant_id", body.tenant_id);

  const { data: vaccines, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Check which ones already have a reminder sent today
  const today_start = new Date().toISOString().substring(0, 10);
  const vaccineIds = (vaccines ?? []).map((v: VaccineRow) => v.id);

  const { data: alreadySent } = vaccineIds.length > 0
    ? await supabase
        .from("vet_message_log")
        .select("vaccine_id")
        .in("vaccine_id", vaccineIds)
        .gte("sent_at", today_start + "T00:00:00")
    : { data: [] };

  const sentVaccineIds = new Set((alreadySent ?? []).map((r: { vaccine_id: string }) => r.vaccine_id));
  const toSend = (vaccines ?? []).filter((v: VaccineRow) => !sentVaccineIds.has(v.id) && v.owner_phone);

  const results = { sent: 0, skipped: 0, errors: 0, log: [] as string[] };

  for (const v of toSend as VaccineRow[]) {
    const daysLeft = Math.ceil((new Date(v.next_due_date).getTime() - Date.now()) / 86400000);
    const message = `Sayın ${v.owner_name},\n\n${v.pet_name} adlı hayvanınızın *${v.vaccine_name}* aşı tarihi ${v.next_due_date} olarak yaklaşmaktadır (${daysLeft} gün kaldı).\n\nRandevu almak için kliniğimizi arayabilirsiniz. 🐾`;

    let status = "logged";

    if (apiToken && phoneNumberId) {
      const ok = await sendWhatsAppCloudAPI(v.owner_phone, message, apiToken, phoneNumberId);
      status = ok ? "gönderildi" : "hata";
      if (ok) results.sent++;
      else results.errors++;
    } else {
      // No API configured — just log as pending
      status = "bekliyor";
      results.skipped++;
    }

    await supabase.from("vet_message_log").insert({
      tenant_id: v.tenant_id,
      vaccine_id: v.id,
      pet_name: v.pet_name,
      owner_name: v.owner_name,
      owner_phone: v.owner_phone,
      message_type: "Aşı Hatırlatma (Otomatik)",
      message_body: message,
      status,
      sent_at: new Date().toISOString(),
    });

    results.log.push(`${v.pet_name} (${v.owner_name}) → ${status}`);
  }

  return new Response(
    JSON.stringify({ success: true, processed: toSend.length, ...results }),
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
  );
});
