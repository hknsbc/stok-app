import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "crypto";

function key(): Buffer {
  const raw = process.env.BACKUP_ENCRYPTION_KEY;
  if (!raw) throw new Error("BACKUP_ENCRYPTION_KEY tanımlı değil");
  const buf = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("BACKUP_ENCRYPTION_KEY 32 bayt olmalı (64 hex veya base64)");
  return buf;
}

// AES-256-GCM: iv(12) | tag(16) | ciphertext → base64
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}

// OAuth state: tenant + kullanıcı + süre, HMAC imzalı (CSRF / başka tenant'a bağlama koruması)
export function signState(payload: { tenantId: string; userId: string }, ttlMs = 10 * 60 * 1000): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlMs })).toString("base64url");
  const sig = createHmac("sha256", key()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyState(state: string): { tenantId: string; userId: string } | null {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", key()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof p.exp !== "number" || p.exp < Date.now()) return null;
    return { tenantId: p.tenantId, userId: p.userId };
  } catch {
    return null;
  }
}
