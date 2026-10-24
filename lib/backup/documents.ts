import { supabaseAdmin } from "@/lib/supabase-admin";
import { DOCUMENT_BUCKETS, DOCUMENT_MAX_BYTES } from "./config";
import type { Drive } from "./google";
import type { Ctx } from "./types";

// Storage'daki belgeler (ürün görselleri, fatura/irsaliye PDF'leri, teklifler, müşteri evrakları)
// `<bucket>/<tenant_id>/...` düzeninde beklenir. Drive'da Documents/<bucket>/<yol>/ altında saklanır.
// Artımlıdır: sürümü değişmeyen dosya tekrar yüklenmez. Manifest, DB silinse bile belgelerin
// nereye ait olduğunu bilmemizi sağlar (Documents/manifest.json).

export type ManifestEntry = { bucket: string; path: string; driveFileId: string; size: number; version: string };
type Obj = { bucket: string; path: string; size: number; version: string };

async function listDir(bucket: string, prefix: string, out: Obj[]): Promise<boolean> {
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) {
      if (/not found|does not exist/i.test(error.message)) return false;
      throw new Error(`Storage (${bucket}) listelenemedi: ${error.message}`);
    }
    for (const it of data ?? []) {
      const path = `${prefix}/${it.name}`;
      if (it.id === null) await listDir(bucket, path, out); // klasör
      else {
        const meta = (it.metadata ?? {}) as { size?: number };
        out.push({ bucket, path, size: Number(meta.size ?? 0), version: `${it.updated_at ?? it.created_at ?? ""}:${meta.size ?? 0}` });
      }
    }
    if (!data || data.length < 1000) return true;
  }
}

async function ensurePath(drive: Drive, root: string, segments: string[], cache: Map<string, string>): Promise<string> {
  let parent = root;
  let key = "";
  for (const seg of segments) {
    key += `/${seg}`;
    let id = cache.get(key);
    if (!id) {
      id = await drive.ensureFolder(seg, parent);
      cache.set(key, id);
    }
    parent = id;
  }
  return parent;
}

async function uploadObject(drive: Drive, parent: string, name: string, data: Buffer, oldId?: string) {
  let id: string;
  if (data.length <= 5 * 1024 * 1024 && !oldId) {
    id = (await drive.upsertSmall(parent, name, data, "application/octet-stream")).id;
  } else {
    const uri = await drive.startResumable(parent, name, "application/octet-stream");
    const f = await drive.putChunk(uri, 0, data, true);
    if (!f) throw new Error("Belge yüklemesi tamamlanmadı");
    id = f.id;
    if (oldId) await drive.delete(oldId).catch(() => {});
  }
  return id;
}

/** true → tüm belgeler yedeklendi. */
export async function runDocumentsPhase(ctx: Ctx): Promise<boolean> {
  const st = ctx.state;
  if (st.docsDone) return true;

  const objs: Obj[] = [];
  for (const bucket of DOCUMENT_BUCKETS) await listDir(bucket, ctx.tenantId, objs);

  const { data: done, error } = await supabaseAdmin
    .from("backup_documents").select("bucket,path,version,drive_file_id,size").eq("tenant_id", ctx.tenantId).range(0, 99999);
  if (error) throw new Error(`backup_documents okunamadı: ${error.message}`);
  const known = new Map((done ?? []).map((d) => [`${d.bucket}\u0000${d.path}`, d]));

  const cache = new Map<string, string>();
  const docsRoot = ctx.folders.Documents;
  let count = st.docsCount ?? 0;

  for (const o of objs) {
    if (Date.now() > ctx.deadline - 15_000) { st.docsCount = count; await ctx.persist(); return false; }
    const prev = known.get(`${o.bucket}\u0000${o.path}`);
    if (prev && prev.version === o.version) continue;
    if (o.size > DOCUMENT_MAX_BYTES) { ctx.warn(`Belge çok büyük, atlandı: ${o.bucket}/${o.path}`); continue; }

    const { data: blob, error: dErr } = await supabaseAdmin.storage.from(o.bucket).download(o.path);
    if (dErr || !blob) { ctx.warn(`Belge indirilemedi: ${o.bucket}/${o.path}`); continue; }
    const buf = Buffer.from(await blob.arrayBuffer());

    const segs = [o.bucket, ...o.path.split("/")];
    const name = segs.pop()!;
    const parent = await ensurePath(ctx.drive, docsRoot, segs, cache);
    const driveId = await uploadObject(ctx.drive, parent, name, buf, prev?.drive_file_id);
    const { error: uErr } = await supabaseAdmin.from("backup_documents").upsert({
      tenant_id: ctx.tenantId, bucket: o.bucket, path: o.path, version: o.version,
      drive_file_id: driveId, size: buf.length, backed_up_at: new Date().toISOString(),
    });
    if (uErr) throw new Error(`backup_documents yazılamadı: ${uErr.message}`);
    count++;
  }

  // Manifest: DB kaybolsa bile belgeler geri yüklenebilsin.
  const { data: all } = await supabaseAdmin
    .from("backup_documents").select("bucket,path,version,drive_file_id,size").eq("tenant_id", ctx.tenantId).range(0, 99999);
  const manifest: ManifestEntry[] = (all ?? []).map((d) => ({
    bucket: d.bucket, path: d.path, driveFileId: d.drive_file_id, size: Number(d.size ?? 0), version: d.version,
  }));
  await ctx.drive.upsertSmall(
    ctx.folders.Documents, "manifest.json",
    Buffer.from(JSON.stringify({ tenantId: ctx.tenantId, generatedAt: new Date().toISOString(), files: manifest })),
    "application/json"
  );
  st.docsDone = true;
  st.docsCount = count;
  await ctx.persist();
  return true;
}

// ── Geri yükleme ───────────────────────────────────────────────────────────
export async function readManifest(drive: Drive, documentsFolder: string): Promise<{ tenantId: string; files: ManifestEntry[] } | null> {
  const f = (await drive.findInFolder(documentsFolder, "manifest.json"))[0];
  if (!f) return null;
  const res = await drive.download(f.id);
  return JSON.parse(await res.text());
}

/** Manifest'teki belgeleri Storage'a geri yükler; yol başındaki eski tenant kimliği yenisiyle değiştirilir. true → bitti. */
export async function restoreDocuments(ctx: Ctx, srcTenant: string): Promise<boolean> {
  const rs = ctx.state.restore!;
  const manifest = await readManifest(ctx.drive, ctx.folders.Documents);
  if (!manifest) return true;
  const files = manifest.files.filter((f) => f.path.startsWith(`${srcTenant}/`));
  const ensured = new Set<string>();
  while (rs.docIdx < files.length) {
    if (Date.now() > ctx.deadline - 15_000) { await ctx.persist(); return false; }
    const f = files[rs.docIdx];
    if (!ensured.has(f.bucket)) {
      const { error } = await supabaseAdmin.storage.createBucket(f.bucket, { public: false });
      if (error && !/already exists|duplicate/i.test(error.message)) throw new Error(`Bucket oluşturulamadı (${f.bucket}): ${error.message}`);
      ensured.add(f.bucket);
    }
    try {
      const res = await ctx.drive.download(f.driveFileId);
      const target = `${ctx.tenantId}${f.path.slice(srcTenant.length)}`;
      const { error } = await supabaseAdmin.storage.from(f.bucket).upload(target, Buffer.from(await res.arrayBuffer()), { upsert: true });
      if (error) throw new Error(error.message);
      rs.docsRestored++;
    } catch (e) {
      ctx.warn(`Belge geri yüklenemedi: ${f.bucket}/${f.path} (${(e as Error).message})`);
    }
    rs.docIdx++;
    if (rs.docIdx % 20 === 0) await ctx.persist();
  }
  return true;
}
