import { describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("limit aşılınca false döner", () => {
    const key = `t-${Math.random()}`;
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(false);
  });

  it("pencere dolunca sayaç sıfırlanır", () => {
    vi.useFakeTimers();
    const key = `t-${Math.random()}`;
    rateLimit(key, 1, 1000);
    expect(rateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000)).toBe(true);
    vi.useRealTimers();
  });

  it("farklı anahtarlar birbirini etkilemez", () => {
    expect(rateLimit(`a-${Math.random()}`, 1, 1000)).toBe(true);
    expect(rateLimit(`b-${Math.random()}`, 1, 1000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("x-forwarded-for değerinin ilk adresini alır", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });
  it("başlık yoksa unknown", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
