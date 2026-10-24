import { describe, expect, it, vi } from "vitest";

const calls: { fn: string; args: Record<string, unknown> }[] = [];
vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    rpc: async (fn: string, args: Record<string, unknown>) => {
      calls.push({ fn, args });
      return { data: Array.isArray(args.p_rows) ? args.p_rows.length : 0, error: null };
    },
    storage: {},
  },
}));

import { footerText, headerText, rowsText, tableStartText, TABLE_END_TEXT } from "@/lib/backup/format";
import { runRestoreStep } from "@/lib/backup/restore";
import type { Ctx, JobState } from "@/lib/backup/types";

const products = Array.from({ length: 7 }, (_, i) => ({ id: `p${i}`, tenant_id: "old", name: `Ürün ççşş ${i}`, stock: i }));
const sales = Array.from({ length: 3 }, (_, i) => ({ id: `s${i}`, tenant_id: "old", product_id: `p${i}`, total: 10 * i }));
const profiles = [{ id: "u1", tenant_id: "old" }];

function backupFile() {
  let t = headerText({ companyName: "Firma", tenantId: "old", backupDate: "x", recordCounts: {} });
  t += tableStartText("profiles", true) + rowsText(profiles, false) + TABLE_END_TEXT;
  t += tableStartText("products", false) + rowsText(products, false) + TABLE_END_TEXT;
  t += tableStartText("sales", false) + rowsText(sales, false) + TABLE_END_TEXT;
  return Buffer.from(t + footerText({ profiles: 1, products: 7, sales: 3 }), "utf8");
}

function fakeDrive(file: Buffer) {
  return {
    get: async () => ({ id: "f", name: "x.json", size: String(file.length) }),
    download: async (_id: string, start = 0, end?: number) => {
      const slice = file.subarray(start, end === undefined ? undefined : end + 1);
      // Akışı küçük parçalara böl: çok baytlı karakterler parça sınırına denk gelsin.
      let i = 0;
      const body = new ReadableStream<Uint8Array>({
        pull(c) {
          if (i >= slice.length) return c.close();
          c.enqueue(new Uint8Array(slice.subarray(i, i + 5)));
          i += 5;
        },
      });
      return new Response(body);
    },
    findInFolder: async () => [],
  };
}

describe("geri yükleme motoru", () => {
  it("her adımda süre dolsa bile satırları tam bir kez, sırayla yazar (byte konumundan devam)", async () => {
    calls.length = 0;
    const file = backupFile();
    const state: JobState = {
      restore: {
        fileId: "f", fileName: "x.json", mode: "merge", stage: "init", purgeIdx: 0, byteOffset: 0, curTable: null,
        productsStart: null, reconOffset: 0, restored: {}, docIdx: 0, docsRestored: 0,
      },
    };
    let result = { finished: false, verification: [] as string[] };
    for (let step = 0; step < 500 && !result.finished; step++) {
      const ctx = {
        job: { id: "j" }, state, tenantId: "new", drive: fakeDrive(file), folders: { Documents: "d" },
        deadline: Date.now() - 1, // her adım yalnızca bir satır işleyip çıkar
        persist: async () => {}, warn: () => {},
      } as unknown as Ctx;
      result = await runRestoreStep(ctx);
    }
    expect(result.finished).toBe(true);
    expect(result.verification).toEqual([]);

    const restored = calls.filter((c) => c.fn === "backup_restore_rows");
    expect(restored.every((c) => c.args.p_src_tenant === "old" && c.args.p_tenant === "new")).toBe(true);
    // profiles geri yüklenmez; products ve sales yazılır
    expect(restored.map((c) => c.args.p_table).every((t) => t === "products" || t === "sales")).toBe(true);
    const ids = restored.flatMap((c) => (c.args.p_rows as { id: string }[]).map((r) => r.id));
    expect(ids).toEqual([...products, ...sales].map((r) => r.id));
    expect(state.restore!.restored).toEqual({ products: 7, sales: 3 });

    const stock = calls.filter((c) => c.fn === "backup_reconcile_stock").flatMap((c) => c.args.p_rows as { id: string; stock: number }[]);
    expect(stock).toEqual(products.map((p) => ({ id: p.id, stock: p.stock })));
  });

  it("tamamlanma işareti olmayan (kesik) yedeği reddeder", async () => {
    const file = backupFile().subarray(0, 300);
    const state: JobState = {
      restore: {
        fileId: "f", fileName: "x.json", mode: "merge", stage: "init", purgeIdx: 0, byteOffset: 0, curTable: null,
        productsStart: null, reconOffset: 0, restored: {}, docIdx: 0, docsRestored: 0,
      },
    };
    const ctx = {
      job: { id: "j" }, state, tenantId: "new", drive: fakeDrive(file), folders: { Documents: "d" },
      deadline: Date.now() + 10_000, persist: async () => {}, warn: () => {},
    } as unknown as Ctx;
    await expect(runRestoreStep(ctx)).rejects.toThrow(/eksik veya bozuk/);
  });
});
