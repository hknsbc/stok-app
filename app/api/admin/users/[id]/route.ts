import { supabaseAdmin, verifyAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Geçersiz istek." }, { status: 400 });

  // Tarih alanları: null (temizle) ya da geçerli bir tarih olmalı
  const validDate = (v: unknown) => v === null || (typeof v === "string" && !Number.isNaN(Date.parse(v)));

  const updates: Record<string, string | boolean | null> = {};
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  for (const key of ["subscription_starts_at", "subscription_expires_at"] as const) {
    if (body[key] === undefined) continue;
    if (!validDate(body[key])) return Response.json({ error: `Geçersiz tarih: ${key}` }, { status: 400 });
    updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Guncelleme alani bulunamadi" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  const { id } = await params;
  if (id === admin.id) return Response.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });

  // Önce profile'ı sil, sonra auth user'ı sil
  await supabaseAdmin.from("profiles").delete().eq("id", id);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
