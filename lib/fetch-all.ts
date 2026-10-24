// Supabase/PostgREST tek istekte en fazla 1000 satır döndürür (sessizce keser).
// Tüm satırlara ihtiyaç duyan sorgular (barkod araması, toplam/rapor hesapları) için
// sayfa sayfa çeker. Kararlı sayfalama için sorguya mutlaka .order(...) ekleyin.
const PAGE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

export async function fetchAllRows<T = Record<string, unknown>>(
  query: (from: number, to: number) => Page<T>
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) return { data: null, error };
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return { data: all, error: null };
}
