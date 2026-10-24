import { describe, expect, it } from "vitest";
import { footerText, headerText, parseLine, parseMeta, rowsText, tableStartText, TABLE_END_TEXT } from "@/lib/backup/format";
import { decryptSecret, encryptSecret, signState, verifyState } from "@/lib/backup/crypto";

function build(tables: Record<string, Record<string, unknown>[]>, pageSize = 2) {
  let out = headerText({ companyName: 'Acme "Ltd" \n Şti', tenantId: "t1", backupDate: "2026-10-24T00:00:00Z", recordCounts: {} });
  let first = true;
  const counts: Record<string, number> = {};
  for (const [name, rows] of Object.entries(tables)) {
    out += tableStartText(name, first);
    first = false;
    let wrote = 0;
    for (let i = 0; i < rows.length || i === 0; i += pageSize) {
      const page = rows.slice(i, i + pageSize);
      out += rowsText(page, wrote > 0);
      wrote += page.length;
      if (!page.length) break;
    }
    out += TABLE_END_TEXT;
    counts[name] = rows.length;
  }
  return out + footerText(counts);
}

describe("yedek dosya formatı", () => {
  const tables = {
    products: [
      { id: "a", name: "Ürün, \"tırnaklı\"\nsatır sonlu", stock: 3 },
      { id: "b", name: "}]{[", stock: 0 },
      { id: "c", name: "ç", stock: 7 },
    ],
    empty: [],
    customers: [{ id: "x", name: "Müşteri" }],
  };

  it("geçerli JSON üretir ve metadata içerir", () => {
    const parsed = JSON.parse(build(tables));
    expect(parsed.backupVersion).toBe("1.0");
    expect(parsed.companyName).toBe('Acme "Ltd" \n Şti');
    expect(parsed.data.products).toHaveLength(3);
    expect(parsed.data.empty).toEqual([]);
    expect(parsed.recordCountsActual).toEqual({ products: 3, empty: 0, customers: 1 });
    expect(parsed.complete).toBe(true);
  });

  it("satır satır okunduğunda aynı veri geri gelir", () => {
    const read: Record<string, unknown[]> = {};
    let cur: string | null = null;
    for (const line of build(tables).split("\n")) {
      const p = parseLine(line);
      if (p.kind === "table") { cur = p.table; read[cur] = []; }
      else if (p.kind === "tableEnd") cur = null;
      else if (p.kind === "row" && cur) read[cur].push(p.row);
    }
    expect(read).toEqual(tables);
  });

  it("üst bilgi ve tamamlanma işaretini çıkarır; kesik dosyada complete yoktur", () => {
    const text = build(tables);
    expect(parseMeta(text.slice(0, 4096)).tenantId).toBe("t1");
    expect(parseMeta(text.slice(-8192)).complete).toBe(true);
    expect(parseMeta(text.slice(0, text.length - 40)).complete).toBeUndefined();
  });
});

describe("gizli veri şifreleme ve OAuth state", () => {
  process.env.BACKUP_ENCRYPTION_KEY = "ab".repeat(32);

  it("şifreleyip çözer, her seferinde farklı çıktı verir", () => {
    const a = encryptSecret("1//refresh-token");
    expect(a).not.toContain("refresh");
    expect(decryptSecret(a)).toBe("1//refresh-token");
    expect(encryptSecret("1//refresh-token")).not.toBe(a);
  });

  it("kurcalanmış şifreli veriyi reddeder", () => {
    const buf = Buffer.from(encryptSecret("x"), "base64");
    buf[buf.length - 1] ^= 1;
    expect(() => decryptSecret(buf.toString("base64"))).toThrow();
  });

  it("state imzasını doğrular, değişmiş veya süresi dolmuşu reddeder", () => {
    const s = signState({ tenantId: "t", userId: "u" });
    expect(verifyState(s)).toEqual({ tenantId: "t", userId: "u" });
    const [body, sig] = s.split(".");
    const forged = Buffer.from(JSON.stringify({ tenantId: "evil", userId: "u", exp: Date.now() + 1e6 })).toString("base64url");
    expect(verifyState(`${forged}.${sig}`)).toBeNull();
    expect(verifyState(`${body}.bad`)).toBeNull();
    expect(verifyState(signState({ tenantId: "t", userId: "u" }, -1))).toBeNull();
  });
});
