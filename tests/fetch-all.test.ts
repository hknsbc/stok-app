import { describe, expect, it } from "vitest";
import { fetchAllRows } from "@/lib/fetch-all";

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i }));

describe("fetchAllRows", () => {
  it("1000 satır sınırını aşan veriyi sayfa sayfa toplar", async () => {
    const all = rows(2500);
    const calls: number[] = [];
    const { data, error } = await fetchAllRows(async (from, to) => {
      calls.push(from);
      return { data: all.slice(from, to + 1), error: null };
    });
    expect(error).toBeNull();
    expect(data).toHaveLength(2500);
    expect(calls).toEqual([0, 1000, 2000]);
  });

  it("tam 1000 satırda bir sonraki sayfayı da sorar", async () => {
    const all = rows(1000);
    let calls = 0;
    const { data } = await fetchAllRows(async (from, to) => {
      calls++;
      return { data: all.slice(from, to + 1), error: null };
    });
    expect(data).toHaveLength(1000);
    expect(calls).toBe(2);
  });

  it("boş sonuçta boş dizi döner", async () => {
    const { data } = await fetchAllRows(async () => ({ data: [], error: null }));
    expect(data).toEqual([]);
  });

  it("hata gelirse kısmi veri döndürmez", async () => {
    const { data, error } = await fetchAllRows(async (from) =>
      from === 0 ? { data: rows(1000), error: null } : { data: null, error: { message: "boom" } }
    );
    expect(data).toBeNull();
    expect(error?.message).toBe("boom");
  });
});
