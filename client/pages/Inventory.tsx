import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  minQuantity: number;
  category: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Bilgisayar Fare",
    sku: "MOUSE-001",
    quantity: 45,
    unit: "adet",
    unitPrice: 125,
    minQuantity: 20,
    category: "Elektrik",
  },
  {
    id: "2",
    name: "USB Kablo",
    sku: "USB-002",
    quantity: 8,
    unit: "adet",
    unitPrice: 45,
    minQuantity: 15,
    category: "Elektrik",
  },
  {
    id: "3",
    name: "Monitör Standı",
    sku: "STAND-003",
    quantity: 120,
    unit: "adet",
    unitPrice: 250,
    minQuantity: 30,
    category: "Aksesuarlar",
  },
  {
    id: "4",
    name: "Klavye",
    sku: "KEY-004",
    quantity: 32,
    unit: "adet",
    unitPrice: 450,
    minQuantity: 20,
    category: "Elektronik",
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState(mockInventory);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minQuantity
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Stok Kartları
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ürün envanterini yönetin ve takip edin
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Yeni Stok
          </Button>
        </div>

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

        {/* Search Bar */}
        <Card className="p-4 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Stok adı veya SKU ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
        </Card>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <Card className="border border-border/50">
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border/50">
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
                  {filteredInventory.map((item) => {
                    const isLowStock = item.quantity <= item.minQuantity;
                    const totalValue = item.quantity * item.unitPrice;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-muted/20 transition-colors ${
                          isLowStock ? "bg-amber-500/5" : ""
                        }`}
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
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
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
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Stok Değeri</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              ₺
              {inventory
                .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                .toFixed(2)}
            </p>
          </Card>

          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Ürün Çeşidi</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {inventory.length}
            </p>
          </Card>

          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Miktar</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)} adet
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
