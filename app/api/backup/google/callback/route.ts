import { supabaseAdmin } from "@/lib/supabase-admin";
import { decryptSecret, encryptSecret, verifyState } from "@/lib/backup/crypto";
import { Drive, exchangeCode } from "@/lib/backup/google";
import { getConnection } from "@/lib/backup/engine";

export const maxDuration = 60;

// Google, kullanıcıyı buraya yönlendirir (Bearer yok): kimlik, imzalı `state` ile doğrulanır.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.GOOGLE_REDIRECT_URI ? new URL(process.env.GOOGLE_REDIRECT_URI).origin : url.origin;
  const back = (q: string) => Response.redirect(`${origin}/ayarlar?${q}`, 302);

  if (url.searchParams.get("error")) return back("drive=denied");
  const code = url.searchParams.get("code");
  const state = verifyState(url.searchParams.get("state") ?? "");
  if (!code || !state) return back("drive=invalid");

  try {
    // Kullanıcı hâlâ bu tenant'a ait mi?
    const { data: profile } = await supabaseAdmin.from("profiles").select("tenant_id").eq("id", state.userId).single();
    if (profile?.tenant_id !== state.tenantId) return back("drive=invalid");

    const tokens = await exchangeCode(code);
    const existing = await getConnection(state.tenantId);
    const refresh = tokens.refreshToken ?? (existing ? decryptSecret(existing.refresh_token_enc) : null);
    if (!refresh) return back("drive=norefresh");
    if (!tokens.scope.includes("auth/drive.file")) return back("drive=scope");

    const drive = new Drive(tokens.accessToken);
    const { rootId, folders } = await drive.ensureStructure();
    const about = await drive.about();

    const { error } = await supabaseAdmin.from("backup_connections").upsert({
      tenant_id: state.tenantId,
      google_email: tokens.email ?? about.email,
      refresh_token_enc: encryptSecret(refresh),
      root_folder_id: rootId,
      folder_ids: folders,
      status: "connected",
      last_error: null,
      connected_by: state.userId,
      connected_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return back("drive=connected");
  } catch (e) {
    console.error("[backup] Google callback hatası:", (e as Error).message);
    return back("drive=error");
  }
}
