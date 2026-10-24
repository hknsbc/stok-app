// Basit, bellek içi sabit-pencere rate limiter.
// Serverless'ta her instance kendi sayacını tutar; bu yüzden kesin bir sınır değil,
// toplu/otomatik kayıt denemelerini yavaşlatan ilk savunma hattıdır.
// Kalıcı ve global sınır için Upstash/Vercel KV veya Supabase tabanlı sayaç kullanın.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
