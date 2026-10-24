import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyAdmin = vi.fn();
const update = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  verifyAdmin: (...a: unknown[]) => verifyAdmin(...a),
  supabaseAdmin: {
    from: () => ({
      update: (u: unknown) => ({ eq: async () => update(u) }),
      delete: () => ({ eq: async () => ({}) }),
    }),
    auth: { admin: { deleteUser: async () => ({ error: null }) } },
  },
}));

import { DELETE, PATCH } from "@/app/api/admin/users/[id]/route";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const patch = (body: unknown, id = "u2") =>
  PATCH(new Request("http://x", { method: "PATCH", body: JSON.stringify(body) }), ctx(id));

beforeEach(() => {
  verifyAdmin.mockReset().mockResolvedValue({ id: "admin1" });
  update.mockReset().mockReturnValue({ error: null });
});

describe("admin /users/[id]", () => {
  it("admin değilse 403", async () => {
    verifyAdmin.mockResolvedValue(null);
    expect((await patch({ is_active: true })).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("geçersiz tarih 400", async () => {
    expect((await patch({ subscription_expires_at: "yarın" })).status).toBe(400);
  });

  it("izin verilmeyen alanlar yazılmaz", async () => {
    const res = await patch({ is_superadmin: true });
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("geçerli güncelleme yazılır", async () => {
    const res = await patch({ is_active: true, subscription_expires_at: "2027-01-01T00:00:00Z" });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ is_active: true, subscription_expires_at: "2027-01-01T00:00:00Z" });
  });

  it("admin kendi hesabını silemez", async () => {
    const res = await DELETE(new Request("http://x", { method: "DELETE" }), ctx("admin1"));
    expect(res.status).toBe(400);
  });
});
