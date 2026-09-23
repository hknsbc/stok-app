"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

type Warehouse = { id: string; name: string };
type Product = { id: string; name: string };

export default function DepoTransferPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [availableQty, setAvailableQty] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!productId || !fromWarehouseId) { setAvailableQty(null); return; }
    (async () => {
      const { data } = await supabase
        .from("product_stock")
        .select("quantity")
        .eq("product_id", productId)
        .eq("warehouse_id", fromWarehouseId)
        .maybeSingle();
      setAvailableQty(data?.quantity ?? 0);
    })();
  }, [productId, fromWarehouseId]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) return;
    setTenantId(profile.tenant_id);
    const [w, p] = await Promise.all([
      supabase.from("warehouses").select("id, name").eq("tenant_id", profile.tenant_id).order("name"),
      supabase.from("products").select("id, name").eq("tenant_id", profile.tenant_id).order("name"),
    ]);
    if (w.data) setWarehouses(w.data);
    if (p.data) setProducts(p.data);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!tenantId) return;
    if (fromWarehouseId === toWarehouseId) { setError("Kaynak ve hedef depo aynı olamaz."); return; }
    const qty = Number(quantity);
    if (!qty || qty <= 0) { setError("Geçerli bir miktar girin."); return; }
    if (availableQty !== null && qty > availableQty) { setError(`Kaynak depoda yalnızca ${availableQty} adet var.`); return; }

    setSaving(true);

    const { data: fromRow } = await supabase
      .from("product_stock").select("id, quantity")
      .eq("product_id", productId).eq("warehouse_id", fromWarehouseId).maybeSingle();
    const newFromQty = (fromRow?.quantity ?? 0) - qty;
    if (fromRow) {
      await supabase.from("product_stock").update({ quantity: newFromQty, updated_at: new Date().toISOString() }).eq("id", fromRow.id);
    }

    const { data: toRow } = await supabase
      .from("product_stock").select("id, quantity")
      .eq("product_id", productId).eq("warehouse_id", toWarehouseId).maybeSingle();
    const newToQty = (toRow?.quantity ?? 0) + qty;
    if (toRow) {
      await supabase.from("product_stock").update({ quantity: newToQty, updated_at: new Date().toISOString() }).eq("id", toRow.id);
    } else {
      await supabase.from("product_stock").insert({ tenant_id: tenantId, product_id: productId, warehouse_id: toWarehouseId, quantity: newToQty });
    }

    await supabase.from("stock_movements").insert([
      {
        tenant_id: tenantId, product_id: productId, warehouse_id: fromWarehouseId,
        change_type: "transfer_cikis", quantity_delta: -qty,
        previous_quantity: fromRow?.quantity ?? 0, new_quantity: newFromQty,
        reference_type: "depo_transfer", note: `Hedef depo: ${toWarehouseId}`, created_by: userId,
      },
      {
        tenant_id: tenantId, product_id: productId, warehouse_id: toWarehouseId,
        change_type: "transfer_giris", quantity_delta: qty,
        previous_quantity: toRow?.quantity ?? 0, new_quantity: newToQty,
        reference_type: "depo_transfer", note: `Kaynak depo: ${fromWarehouseId}`, created_by: userId,
      },
    ]);

    setSaving(false);
    setSuccess(true);
    setAvailableQty(newFromQty);
    setQuantity("1");
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>Depolar Arası Transfer</h1>

        <form onSubmit={handleTransfer} style={{
          background: "white", padding: 24, borderRadius: 12,
          display: "flex", flexDirection: "column", gap: 14,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}>
          <div>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4, fontWeight: 500 }}>Ürün</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} required
              style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}>
              <option value="">Ürün seçin</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4, fontWeight: 500 }}>Kaynak Depo</label>
            <select value={fromWarehouseId} onChange={(e) => setFromWarehouseId(e.target.value)} required
              style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}>
              <option value="">Depo seçin</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            {availableQty !== null && (
              <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Bu depoda mevcut: {availableQty} adet</p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4, fontWeight: 500 }}>Hedef Depo</label>
            <select value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)} required
              style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}>
              <option value="">Depo seçin</option>
              {warehouses.filter((w) => w.id !== fromWarehouseId).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4, fontWeight: 500 }}>Miktar</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required
              style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", color: "#16a34a", fontSize: 13 }}>
              ✓ Transfer tamamlandı.
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: "11px 0", background: saving ? "#c7d2fe" : "#6366f1", color: "white",
              border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold",
            }}>
              {saving ? "Aktarılıyor..." : "Transfer Et"}
            </button>
            <button type="button" onClick={() => router.push("/stok/depolar")} style={{
              flex: 1, padding: "11px 0", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer",
            }}>
              Vazgeç
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
