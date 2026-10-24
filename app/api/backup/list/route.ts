import { requireTenantUser } from "@/lib/backup/auth";
import { driveFor, ensureFolders, getConnection } from "@/lib/backup/engine";

export const maxDuration = 60;

export async function GET(request: Request) {
  const user = await requireTenantUser(request);
  if (!user) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });
  const conn = await getConnection(user.tenantId);
  if (!conn) return Response.json({ error: "Google Drive bağlı değil" }, { status: 400 });

  try {
    const drive = await driveFor(conn);
    const folders = await ensureFolders(drive, conn);
    const out: { id: string; name: string; size: number; createdTime?: string; kind: "Daily" | "Monthly" | "Yearly"; url?: string }[] = [];
    for (const kind of ["Daily", "Monthly", "Yearly"] as const) {
      const files = await drive.list(`'${folders[kind]}' in parents and trashed = false and name contains '.json'`, "name desc", 2000);
      for (const f of files) {
        out.push({ id: f.id, name: f.name, size: Number(f.size ?? 0), createdTime: f.createdTime, kind, url: f.webViewLink });
      }
    }
    return Response.json({ files: out });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
