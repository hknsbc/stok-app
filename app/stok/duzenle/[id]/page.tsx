"use client";
import { use, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Warehouse = { id: string; name: string; is_default: boolean };
type StockRow = { id: string; warehouse_id: string; quantity: number };

export default function UrunDuzenle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLang();

  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("");
  const [alisFiyati, setAlisFiyati] = useState("");
  const [satisFiyati, setSatisFiyati] = useState("");
  const [loading, setLoading] = useState(true);
  const [barcodeScanned, setBarcodeScanned] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [newWarehouseId, setNewWarehouseId] = useState("");
  const [newWarehouseQty, setNewWarehouseQty] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products").select("*").eq("id", id).single();
      if (error || !data) { alert(t.productNotFound); router.push("/stok"); return; }
      setName(data.name);
      setBarcode(data.barcode ?? "");
      setStock(String(data.stock ?? ""));
      setAlisFiyati(String(data.price ?? ""));
      setSatisFiyati(String(data.selling_price ?? ""));
      setTenantId(data.tenant_id);

      const [w, ps] = await Promise.all([
        supabase.from("warehouses").select("id, name, is_default").eq("tenant_id", data.tenant_id).order("name"),
        supabase.from("product_stock").select("id, warehouse_id, quantity").eq("product_id", id),
      ]);
      if (w.data) setWarehouses(w.data);
      if (ps.data) setStockRows(ps.data);

      setLoading(false);
    };
    fetchProduct();
  }, [id, router]);

  const refreshTotal = async (rows: StockRow[]) => {
    const total = rows.reduce((sum, r) => sum + r.quantity, 0);
    setStock(String(total));
    await supabase.from("products").update({ stock: total }).eq("id", id);
  };

  const handleWarehouseQtyChange = async (rowId: string, qty: number) => {
    if (qty < 0) return;
    await supabase.from("product_stock").update({ quantity: qty, updated_at: new Date().toISOString() }).eq("id", rowId);
    const updated = stockRows.map((r) => (r.id === rowId ? { ...r, quantity: qty } : r));
    setStockRows(updated);
    await refreshTotal(updated);
  };

  const handleAddWarehouseRow = async () => {
    if (!newWarehouseId || !tenantId) return;
    const qty = Number(newWarehouseQty) || 0;
    const { data, error } = await supabase.from("product_stock").insert({
      tenant_id: tenantId,
      product_id: id,
      warehouse_id: newWarehouseId,
      quantity: qty,
    }).select("id, warehouse_id, quantity").single();
    if (error || !data) { alert(t.errorPrefix + " " + (error?.message ?? "")); return; }
    const updated = [...stockRows, data];
    setStockRows(updated);
    setNewWarehouseId("");
    setNewWarehouseQty("");
    await refreshTotal(updated);
  };

  // Barkod alanına scanner okutunca Enter gelir — görsel onay göster
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (barcode.trim()) {
        setBarcodeScanned(true);
        setTimeout(() => setBarcodeScanned(false), 2000);
      }
    }
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const { error } = await supabase.from("products").update({
      name,
      barcode: barcode.trim() || null,
      stock: Number(stock),
      price: Number(alisFiyati),
      selling_price: Number(satisFiyati),
    }).eq("id", id);

    if (error) { alert(`${t.errorPrefix} ${error.message}`); return; }
    router.push("/stok");
  };

  const inputStyle: React.CSSProperties = { padding: 10, border: "1px solid #ccc", borderRadius: 6, width: "100%", fontSize: 14, boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 500 };

  if (loading) return <DashboardLayout><p style={{ color: "#888" }}>{t.loading}</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>{t.editProduct}</h1>
        <form onSubmit={handleSave} style={{ background: "white", padding: 28, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>{t.productName}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>

          {/* Barkod alanı — scanner okutulabilir */}
          <div>
            <label style={labelStyle}>
              🔖 {t.barcodeLabel}
              <span style={{ fontSize: 11, color: "#888", fontWeight: 400, marginLeft: 6 }}>
                (okutun veya yazın)
              </span>
            </label>
            <input
              ref={barcodeRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder={t.barcodePlaceholderScan}
              style={{
                ...inputStyle,
                border: barcodeScanned ? "2px solid #10b981" : barcode ? "2px solid #6366f1" : "1px solid #ccc",
              }}
            />
            {barcodeScanned && (
              <p style={{ marginTop: 6, fontSize: 12, color: "#10b981", fontWeight: 600 }}>
                ✓ Barkod atandı: {barcode}
              </p>
            )}
            {barcode && !barcodeScanned && (
              <p style={{ marginTop: 6, fontSize: 12, color: "#6366f1" }}>
                Barkod: {barcode}
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>
              {t.stockCount} {stockRows.length > 0 && <span style={{ fontWeight: 400, color: "#888" }}>(depo toplamı — aşağıdan düzenleyin)</span>}
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={stockRows.length > 0}
              style={{ ...inputStyle, background: stockRows.length > 0 ? "#f3f4f6" : "white" }}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.buyPrice}</label>
            <input type="number" step="0.01" value={alisFiyati} onChange={(e) => setAlisFiyati(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.sellPrice}</label>
            <input type="number" step="0.01" value={satisFiyati} onChange={(e) => setSatisFiyati(e.target.value)} required style={inputStyle} />
          </div>

          {alisFiyati && satisFiyati && (
            <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 8, fontSize: 13, color: "#16a34a" }}>
              {t.unitProfit} {(Number(satisFiyati) - Number(alisFiyati)).toFixed(2)} TL
              {Number(alisFiyati) > 0 && ` (%${(((Number(satisFiyati) - Number(alisFiyati)) / Number(alisFiyati)) * 100).toFixed(1)})`}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" style={{ flex: 1, padding: "11px 0", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
              {t.update}
            </button>
            <button type="button" onClick={() => router.push("/stok")} style={{ flex: 1, padding: "11px 0", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}>
              {t.cancel}
            </button>
          </div>
        </form>

        <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginTop: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 14 }}>🏬 Depo Dağılımı</h2>

          {stockRows.length === 0 && (
            <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Bu ürün henüz hiçbir depoya atanmamış.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {stockRows.map((row) => {
              const w = warehouses.find((x) => x.id === row.warehouse_id);
              return (
                <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{w?.name ?? "Bilinmeyen depo"}</span>
                  <input
                    type="number"
                    min={0}
                    value={row.quantity}
                    onChange={(e) => handleWarehouseQtyChange(row.id, Number(e.target.value))}
                    style={{ width: 100, padding: 8, border: "1px solid #ccc", borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={newWarehouseId}
              onChange={(e) => setNewWarehouseId(e.target.value)}
              style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6, fontSize: 13 }}
            >
              <option value="">Depo ekle...</option>
              {warehouses.filter((w) => !stockRows.some((r) => r.warehouse_id === w.id)).map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              placeholder="Miktar"
              value={newWarehouseQty}
              onChange={(e) => setNewWarehouseQty(e.target.value)}
              style={{ width: 100, padding: 8, border: "1px solid #ccc", borderRadius: 6, fontSize: 13 }}
            />
            <button
              type="button"
              onClick={handleAddWarehouseRow}
              disabled={!newWarehouseId}
              style={{ padding: "8px 16px", background: newWarehouseId ? "#6366f1" : "#e5e7eb", color: "white", border: "none", borderRadius: 6, cursor: newWarehouseId ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}
            >
              Ekle
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
