import { supabaseAdmin, verifyAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, any> = {};
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  if (body.subscription_starts_at !== undefined) updates.subscription_starts_at = body.subscription_starts_at;
  if (body.subscription_expires_at !== undefined) updates.subscription_expires_at = body.subscription_expires_at;

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

  // Önce profile'ı sil, sonra auth user'ı sil
  await supabaseAdmin.from("profiles").delete().eq("id", id);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
