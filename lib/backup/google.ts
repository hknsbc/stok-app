import { CHUNK_ALIGN, ROOT_FOLDER_NAME, SUBFOLDERS, type SubFolder } from "./config";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";
// drive.file: yalnızca bu uygulamanın oluşturduğu dosya/klasörlere erişir (kullanıcının tüm Drive'ına değil).
const SCOPES = ["https://www.googleapis.com/auth/drive.file", "openid", "email"];

export class GoogleAuthError extends Error {}

function clientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI tanımlı değil");
  }
  return { clientId, clientSecret, redirectUri };
}

export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI && process.env.BACKUP_ENCRYPTION_KEY
  );
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = clientConfig();
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent", // refresh_token'ın her bağlamada dönmesi için
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${p}`;
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = `${json.error ?? res.status}: ${json.error_description ?? ""}`.trim();
    if (json.error === "invalid_grant") throw new GoogleAuthError(`Google erişimi iptal edilmiş veya süresi dolmuş (${msg})`);
    throw new Error(`Google token hatası: ${msg}`);
  }
  return json as { access_token: string; refresh_token?: string; expires_in: number; id_token?: string; scope?: string };
}

export async function exchangeCode(code: string) {
  const { clientId, clientSecret, redirectUri } = clientConfig();
  const t = await tokenRequest({
    code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code",
  });
  let email: string | null = null;
  if (t.id_token) {
    try {
      email = JSON.parse(Buffer.from(t.id_token.split(".")[1], "base64url").toString("utf8")).email ?? null;
    } catch { /* id_token okunamadı: e-posta gösterilmez */ }
  }
  return { accessToken: t.access_token, refreshToken: t.refresh_token ?? null, email, scope: t.scope ?? "" };
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const { clientId, clientSecret } = clientConfig();
  const t = await tokenRequest({
    refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token",
  });
  return t.access_token;
}

export async function revokeToken(token: string) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => {});
}

// ── Drive istemcisi ────────────────────────────────────────────────────────
export type DriveFile = {
  id: string; name: string; size?: string; mimeType?: string;
  createdTime?: string; modifiedTime?: string; webViewLink?: string; parents?: string[];
};

const FILE_FIELDS = "id,name,size,mimeType,createdTime,modifiedTime,webViewLink,parents";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const q = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

export class Drive {
  constructor(private token: string) {}

  // 429/5xx ve ağ hatalarında üstel geri çekilmeyle yeniden dener.
  private async req(url: string, init: RequestInit = {}, retries = 4): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      let res: Response | null = null;
      try {
        res = await fetch(url, {
          ...init,
          headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${this.token}` },
        });
      } catch (e) {
        if (attempt >= retries) throw e;
      }
      if (res) {
        if (res.status === 401) throw new GoogleAuthError("Google oturumu geçersiz (401)");
        if (res.status !== 429 && res.status < 500) return res;
        if (attempt >= retries) return res;
      }
      await sleep(500 * 2 ** attempt);
    }
  }

  private async json<T>(res: Response, what: string): Promise<T> {
    if (!res.ok) throw new Error(`Drive ${what} hatası (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return (await res.json()) as T;
  }

  async about(): Promise<{ email: string | null; used: number; limit: number | null }> {
    const j = await this.json<{ user?: { emailAddress?: string }; storageQuota?: { usage?: string; limit?: string } }>(
      await this.req(`${DRIVE}/about?fields=user(emailAddress),storageQuota(usage,limit)`), "about");
    return {
      email: j.user?.emailAddress ?? null,
      used: Number(j.storageQuota?.usage ?? 0),
      limit: j.storageQuota?.limit ? Number(j.storageQuota.limit) : null,
    };
  }

  async list(query: string, orderBy = "createdTime desc", max = 5000): Promise<DriveFile[]> {
    const out: DriveFile[] = [];
    let pageToken: string | undefined;
    do {
      const p = new URLSearchParams({
        q: query, orderBy, pageSize: "1000", fields: `nextPageToken,files(${FILE_FIELDS})`, spaces: "drive",
      });
      if (pageToken) p.set("pageToken", pageToken);
      const j = await this.json<{ files: DriveFile[]; nextPageToken?: string }>(await this.req(`${DRIVE}/files?${p}`), "list");
      out.push(...j.files);
      pageToken = j.nextPageToken;
    } while (pageToken && out.length < max);
    return out;
  }

  async get(id: string): Promise<DriveFile> {
    return this.json<DriveFile>(await this.req(`${DRIVE}/files/${id}?fields=${FILE_FIELDS}`), "get");
  }

  async exists(id: string): Promise<boolean> {
    const res = await this.req(`${DRIVE}/files/${id}?fields=id,trashed`);
    if (res.status === 404) return false;
    const j = await this.json<{ trashed?: boolean }>(res, "exists");
    return !j.trashed;
  }

  async findInFolder(parent: string, name: string): Promise<DriveFile[]> {
    return this.list(`'${parent}' in parents and name = '${q(name)}' and trashed = false`);
  }

  async createFolder(name: string, parent?: string): Promise<DriveFile> {
    return this.json<DriveFile>(await this.req(`${DRIVE}/files?fields=${FILE_FIELDS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", ...(parent ? { parents: [parent] } : {}) }),
    }), "createFolder");
  }

  async ensureFolder(name: string, parent?: string): Promise<string> {
    const base = `mimeType = 'application/vnd.google-apps.folder' and name = '${q(name)}' and trashed = false`;
    const found = await this.list(parent ? `${base} and '${parent}' in parents` : base, "createdTime asc", 1);
    if (found[0]) return found[0].id;
    return (await this.createFolder(name, parent)).id;
  }

  async ensureStructure(): Promise<{ rootId: string; folders: Record<SubFolder, string> }> {
    const rootId = await this.ensureFolder(ROOT_FOLDER_NAME);
    const folders = {} as Record<SubFolder, string>;
    for (const f of SUBFOLDERS) folders[f] = await this.ensureFolder(f, rootId);
    return { rootId, folders };
  }

  async delete(id: string) {
    const res = await this.req(`${DRIVE}/files/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) throw new Error(`Drive delete hatası (${res.status})`);
  }

  async copy(id: string, name: string, parent: string): Promise<DriveFile> {
    return this.json<DriveFile>(await this.req(`${DRIVE}/files/${id}/copy?fields=${FILE_FIELDS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parents: [parent] }),
    }), "copy");
  }

  // Küçük dosya (multipart). Aynı isimli dosya varsa İÇERİĞİ güncellenir (kimliği korunur).
  async upsertSmall(parent: string, name: string, data: Buffer, mimeType: string): Promise<DriveFile> {
    const existing = (await this.findInFolder(parent, name))[0];
    if (existing) {
      return this.json<DriveFile>(await this.req(`${UPLOAD}/files/${existing.id}?uploadType=media&fields=${FILE_FIELDS}`, {
        method: "PATCH", headers: { "Content-Type": mimeType }, body: new Uint8Array(data),
      }), "update");
    }
    const boundary = `sp${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    const meta = JSON.stringify({ name, parents: [parent], mimeType });
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
      data,
      Buffer.from(`\r\n--${boundary}--`),
    ]);
    return this.json<DriveFile>(await this.req(`${UPLOAD}/files?uploadType=multipart&fields=${FILE_FIELDS}`, {
      method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body: new Uint8Array(body),
    }), "upload");
  }

  // ── Resumable (parçalı) yükleme ─────────────────────────────────────────
  async startResumable(parent: string, name: string, mimeType: string): Promise<string> {
    const res = await this.req(`${UPLOAD}/files?uploadType=resumable&fields=${FILE_FIELDS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": mimeType },
      body: JSON.stringify({ name, parents: [parent], mimeType }),
    });
    if (!res.ok) throw new Error(`Drive resumable başlatılamadı (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const uri = res.headers.get("location");
    if (!uri) throw new Error("Drive resumable oturum adresi alınamadı");
    return uri;
  }

  // Drive'ın şu ana dek aldığı bayt sayısı (tamamlandıysa dosya döner).
  async resumableStatus(uri: string): Promise<{ received: number; done?: DriveFile }> {
    const res = await this.req(uri, { method: "PUT", headers: { "Content-Range": "bytes */*", "Content-Length": "0" } });
    if (res.status === 200 || res.status === 201) return { received: 0, done: (await res.json()) as DriveFile };
    if (res.status === 308) {
      const m = /bytes=0-(\d+)/.exec(res.headers.get("range") ?? "");
      return { received: m ? Number(m[1]) + 1 : 0 };
    }
    throw new Error(`Drive resumable durumu alınamadı (${res.status})`);
  }

  /**
   * data'yı `offset` konumundan itibaren yükler. final=true ise toplam boyut bildirilir ve
   * data 256 KiB katı olmak zorunda değildir. Ağ hatasında Drive'a durum sorulup kaldığı yerden devam edilir.
   */
  async putChunk(uri: string, offset: number, data: Buffer, final: boolean): Promise<DriveFile | null> {
    if (!final && (data.length === 0 || data.length % CHUNK_ALIGN !== 0)) {
      throw new Error("Ara parçalar 256 KiB katı olmalı");
    }
    const total = offset + data.length;
    let sent = 0;
    for (let attempt = 0; ; attempt++) {
      const part = data.subarray(sent);
      const start = offset + sent;
      const range = part.length === 0 ? `bytes */${total}` : `bytes ${start}-${total - 1}/${final ? total : "*"}`;
      try {
        const res = await fetch(uri, {
          method: "PUT",
          headers: { Authorization: `Bearer ${this.token}`, "Content-Range": range, "Content-Length": String(part.length) },
          body: new Uint8Array(part),
        });
        if (res.status === 200 || res.status === 201) return (await res.json()) as DriveFile;
        if (res.status === 308) {
          const m = /bytes=0-(\d+)/.exec(res.headers.get("range") ?? "");
          const received = m ? Number(m[1]) + 1 : 0;
          if (!final && received === total) return null;
          if (received >= offset && received < total) { sent = received - offset; throw new Error("kısmi kabul"); }
          throw new FatalUploadError(`Drive beklenmeyen konum bildirdi (${received}/${total})`);
        }
        if (res.status === 401) throw new GoogleAuthError("Google oturumu geçersiz (401)");
        if (res.status === 404 || res.status === 410) throw new FatalUploadError("Drive yükleme oturumu sona ermiş");
        throw new Error(`Drive parça yükleme hatası (${res.status})`);
      } catch (e) {
        if (e instanceof GoogleAuthError || e instanceof FatalUploadError || attempt >= 4) throw e;
        await sleep(700 * 2 ** attempt);
        // Parça Drive'a ulaşmış olabilir: durumu sor, kaldığı yerden devam et.
        try {
          const st = await this.resumableStatus(uri);
          if (st.done) return st.done;
          if (st.received >= offset && st.received <= total) sent = st.received - offset;
        } catch { /* durum alınamadı: aynı aralık yeniden denenir */ }
      }
    }
  }

  // Dosya içeriği (isteğe bağlı bayt aralığı). Akış olarak döner.
  async download(id: string, rangeStart?: number, rangeEnd?: number): Promise<Response> {
    const headers: Record<string, string> = {};
    if (rangeStart !== undefined) headers.Range = `bytes=${rangeStart}-${rangeEnd ?? ""}`;
    const res = await this.req(`${DRIVE}/files/${id}?alt=media`, { headers });
    if (!res.ok && res.status !== 206) throw new Error(`Drive indirme hatası (${res.status})`);
    return res;
  }
}

class FatalUploadError extends Error {}
