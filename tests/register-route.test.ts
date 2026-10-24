import { beforeEach, describe, expect, it, vi } from "vitest";

const createUser = vi.fn();
const deleteUser = vi.fn();
const profilesUpdate = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: (...a: unknown[]) => createUser(...a),
        deleteUser: (...a: unknown[]) => deleteUser(...a),
      },
    },
    from: () => ({
      update: (...a: unknown[]) => ({ eq: () => profilesUpdate(...a) }),
      select: () => ({ eq: () => ({ single: async () => ({ data: { tenant_id: "t1" } }) }) }),
    }),
  },
}));

import { POST } from "@/app/api/auth/register/route";

let ipCounter = 0;
const call = (body: unknown) =>
  POST(
    new Request("http://x/api/auth/register", {
      method: "POST",
      headers: { "x-forwarded-for": `10.0.0.${++ipCounter}` },
      body: JSON.stringify(body),
    })
  );

const valid = {
  email: "a@b.co",
  password: "12345678",
  mode: "stok",
  phone: "555",
  companyName: "X",
  selectedPlan: "temel",
  requiredConsent: true,
};

beforeEach(() => {
  createUser.mockReset().mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  deleteUser.mockReset().mockResolvedValue({});
  profilesUpdate.mockReset().mockResolvedValue({ error: null });
});

describe("POST /api/auth/register", () => {
  it("zorunlu onay yoksa 400", async () => {
    expect((await call({ ...valid, requiredConsent: false })).status).toBe(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("geçersiz e-posta 400", async () => {
    expect((await call({ ...valid, email: "bozuk" })).status).toBe(400);
  });

  it("kısa şifre 400", async () => {
    expect((await call({ ...valid, password: "123" })).status).toBe(400);
  });

  it("geçersiz plan ve mod 400", async () => {
    expect((await call({ ...valid, selectedPlan: "bedava" })).status).toBe(400);
    expect((await call({ ...valid, mode: "hack" })).status).toBe(400);
  });

  it("stok modunda telefon zorunlu", async () => {
    expect((await call({ ...valid, phone: " " })).status).toBe(400);
  });

  it("stok kaydı pasif (admin onayı bekler), otomatik giriş yok", async () => {
    const res = await call(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, autoLogin: false });
    expect(profilesUpdate.mock.calls[0][0]).toMatchObject({ is_active: false });
  });

  it("pet/vet kaydı 7 gün deneme ile aktif", async () => {
    const res = await call({ ...valid, mode: "vet", phone: undefined });
    expect((await res.json()).autoLogin).toBe(true);
    expect(profilesUpdate.mock.calls[0][0]).toMatchObject({ is_active: true });
    expect(profilesUpdate.mock.calls[0][0].subscription_expires_at).toBeTruthy();
  });

  it("profil güncellenemezse kullanıcı geri alınır", async () => {
    profilesUpdate.mockResolvedValue({ error: { message: "x" } });
    const res = await call(valid);
    expect(res.status).toBe(500);
    expect(deleteUser).toHaveBeenCalledWith("u1");
  });

  it("aynı IP'den saatte 5'ten fazla deneme 429", async () => {
    const mk = () =>
      POST(
        new Request("http://x", {
          method: "POST",
          headers: { "x-forwarded-for": "9.9.9.9" },
          body: JSON.stringify({ ...valid, requiredConsent: false }),
        })
      );
    for (let i = 0; i < 5; i++) expect((await mk()).status).toBe(400);
    expect((await mk()).status).toBe(429);
  });
});
