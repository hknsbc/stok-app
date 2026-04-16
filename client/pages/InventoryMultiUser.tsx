import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Minus,
} from "lucide-react";
import { StockItem } from "@shared/api";

interface StockItemWithUI extends StockItem {
  isUpdating?: boolean;
}

export default function InventoryMultiUser() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockItemWithUI[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockItemWithUI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "",
    unit: "adet",
    unitPrice: "",
    minQuantity: "",
    category: "Diğer",
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stocks", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setStocks(data.stocks);
        setFilteredStocks(data.stocks);
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = stocks.filter(
      (item) =>
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.sku.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStocks(filtered);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku) {
      alert("Ürün adı ve SKU gereklidir");
      return;
    }

    try {
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity) || 0,
          unitPrice: parseFloat(formData.unitPrice) || 0,
          minQuantity: parseInt(formData.minQuantity) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStocks([...stocks, data.stock]);
        setFilteredStocks([...stocks, data.stock]);
        setFormData({
          name: "",
          sku: "",
          quantity: "",
          unit: "adet",
          unitPrice: "",
          minQuantity: "",
          category: "Diğer",
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add stock:", error);
    }
  };

  const handleUpdateQuantity = async (
    stockId: string,
    operationType: "add" | "remove",
    quantity: number
  ) => {
    if (quantity <= 0) {
      alert("Miktar 0'dan büyük olmalıdır");
      return;
    }

    try {
      // Update UI optimistically
      const stock = stocks.find((s) => s.id === stockId);
      if (!stock) return;

      setStocks((prev) =>
        prev.map((s) =>
          s.id === stockId ? { ...s, isUpdating: true } : s
        )
      );

      const response = await fetch(`/api/stocks/${stockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          operationType,
          quantity,
          reason: `${operationType === "add" ? "Stok Ekle" : "Stok Çıkar"}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedStock = data.stock;
        setStocks((prev) =>
          prev.map((s) =>
            s.id === stockId
              ? { ...updatedStock, isUpdating: false }
              : s
          )
        );
        setFilteredStocks((prev) =>
          prev.map((s) =>
            s.id === stockId
              ? { ...updatedStock, isUpdating: false }
              : s
          )
        );
      } else {
        alert(data.message || "Stok güncellenemedi");
        fetchStocks();
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
      fetchStocks();
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    if (confirm("Bu stoku silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/stocks/${stockId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setStocks((prev) => prev.filter((s) => s.id !== stockId));
          setFilteredStocks((prev) => prev.filter((s) => s.id !== stockId));
        }
      } catch (error) {
        console.error("Failed to delete stock:", error);
      }
    }
  };

  const lowStockItems = stocks.filter((s) => s.quantity <= s.minQuantity);
  const totalValue = stocks.reduce(
    (sum, s) => sum + s.quantity * s.unitPrice,
    0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Stok Kartları</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.company} - Ürün envanterini yönetin ve takip edin
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Stok
          </Button>
        </div>

        {/* Add Stock Form */}
        {showAddForm && (
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Yeni Stok Ekle</h3>
            <form onSubmit={handleAddStock} className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Ürün Adı"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-muted/30 border-border/50"
              />
              <Input
                type="text"
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="bg-muted/30 border-border/50"
              />
              <Input
                type="number"
                placeholder="Miktar"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="bg-muted/30 border-border/50"
              />
              <Input
                type="text"
                placeholder="Birim"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="bg-muted/30 border-border/50"
              />
              <Input
                type="number"
                placeholder="Birim Fiyat"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                className="bg-muted/30 border-border/50"
              />
              <Input
                type="number"
                placeholder="Min. Stok"
                value={formData.minQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minQuantity: e.target.value })
                }
                className="bg-muted/30 border-border/50"
              />
              <Input
                type="text"
                placeholder="Kategori"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="bg-muted/30 border-border/50 col-span-2"
              />
              <div className="col-span-2 flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                >
                  Ekle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-border/50"
                >
                  İptal
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="p-4 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  {lowStockItems.length} Ürün Stok Seviyesinin Altında
                </h3>
                <p className="text-sm text-amber-800 mt-1">
                  {lowStockItems.map((item) => item.name).join(", ")}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <Card className="p-4 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Stok adı veya SKU ile ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Stok Değeri</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              ₺{totalValue.toFixed(2)}
            </p>
          </Card>
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Ürün Çeşidi</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {stocks.length}
            </p>
          </Card>
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Miktar</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {stocks.reduce((sum, s) => sum + s.quantity, 0)} adet
            </p>
          </Card>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <Card className="border border-border/50">
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border/30">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Ürün Adı
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-foreground">
                      Miktar
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-foreground">
                      Birim Fiyat
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-foreground">
                      Toplam Değer
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-foreground">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((item) => {
                      const isLowStock = item.quantity <= item.minQuantity;
                      const totalValue = item.quantity * item.unitPrice;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/20 transition-colors ${
                            isLowStock ? "bg-amber-500/5" : ""
                          } ${item.isUpdating ? "opacity-50" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {item.name}
                              </p>
                              {isLowStock && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Stok uyarısı
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-muted-foreground">
                            {item.sku}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-semibold text-foreground">
                              {item.quantity}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">
                            ₺{item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground">
                            ₺{totalValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 justify-center">
                              <Button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, "add", 1)
                                }
                                disabled={item.isUpdating}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-500/10"
                                title="Stok Ekle"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, "remove", 1)
                                }
                                disabled={item.isUpdating}
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:bg-orange-500/10"
                                title="Stok Çıkar"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteStock(item.id)}
                                disabled={item.isUpdating}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-muted-foreground">
                          {stocks.length === 0
                            ? "Henüz stok eklenmemiştir"
                            : "Arama kriterlerine uygun stok yok"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
