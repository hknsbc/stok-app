import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  Barcode,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Check,
} from "lucide-react";

interface SaleItem {
  id: string;
  barcode: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  date: string;
  total: number;
  status: "Devam Ediyor" | "Tamamlandı";
}

const mockAvailableProducts: Omit<SaleItem, "quantity">[] = [
  {
    id: "1",
    barcode: "8690202307701",
    name: "Bilgisayar Fare",
    unitPrice: 125,
    stock: 45,
  },
  {
    id: "2",
    barcode: "8690202307702",
    name: "USB Kablo",
    unitPrice: 45,
    stock: 8,
  },
  {
    id: "3",
    barcode: "8690202307703",
    name: "Monitör Standı",
    unitPrice: 250,
    stock: 120,
  },
  {
    id: "4",
    barcode: "8690202307704",
    name: "Klavye",
    unitPrice: 450,
    stock: 32,
  },
];

export default function Sales() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [completedSales, setCompletedSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState("");
  const [includeKdv, setIncludeKdv] = useState(true);
  const KDV_RATE = 0.2; // %20

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = mockAvailableProducts.find(
      (p) => p.barcode === barcodeInput
    );

    if (!product) {
      setMessage("❌ Ürün bulunamadı!");
      setTimeout(() => setMessage(""), 3000);
      setBarcodeInput("");
      return;
    }

    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCartItems(
          cartItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
        setMessage(`✓ ${product.name} miktarı artırıldı`);
      } else {
        setMessage("❌ Yeterli stok yok!");
      }
    } else {
      if (product.stock > 0) {
        setCartItems([
          ...cartItems,
          { ...product, quantity: 1 },
        ]);
        setMessage(`✓ ${product.name} sepete eklendi`);
      } else {
        setMessage("❌ Stokta yok!");
      }
    }

    setTimeout(() => setMessage(""), 3000);
    setBarcodeInput("");
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && quantity <= item.stock && quantity > 0) {
      setCartItems(
        cartItems.map((i) =>
          i.id === id ? { ...i, quantity } : i
        )
      );
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      setMessage("❌ Sepet boş!");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      items: cartItems,
      date: new Date().toISOString(),
      total,
      status: "Tamamlandı",
    };

    setCompletedSales([newSale, ...completedSales]);
    setCartItems([]);
    setMessage("✓ Satış işlemi tamamlandı!");
    setTimeout(() => setMessage(""), 3000);
  };

  const todaysSales = completedSales.filter(
    (sale) =>
      new Date(sale.date).toDateString() === new Date().toDateString()
  );
  const todayTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Satışlar</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Satış işlemlerini yönetin ve hızlı satış yapın
          </p>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugün Satış</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ₺{todayTotal.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugün İşlem</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {todaysSales.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sepetteki Ürün</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Point of Sale */}
          <div className="lg:col-span-2 space-y-4">
            {/* Barcode Scanner */}
            <Card className="p-6 border border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
              <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Barkod Okuyucu
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Barcode className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Barkodu tarayın veya manuel girin..."
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        autoFocus
                        className="pl-10 bg-background border-border/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                    >
                      Ekle
                    </Button>
                  </div>
                </div>
              </form>

              {message && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    message.startsWith("✓")
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {message}
                </div>
              )}
            </Card>

            {/* Cart Items */}
            <Card className="border border-border/50">
              <div className="p-4 border-b border-border/30">
                <h3 className="font-semibold text-foreground">Sepet</h3>
              </div>
              <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto opacity-30 mb-2" />
                    <p>Sepet boş</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-muted/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.barcode}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            ₺{item.unitPrice.toFixed(2)} / adet
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-12 text-center border border-border rounded px-2 py-1 text-sm bg-muted/30"
                            />
                            <span className="text-xs text-muted-foreground">
                              adet
                            </span>
                          </div>
                          <p className="font-semibold text-foreground">
                            ₺
                            {(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="space-y-4">
            {/* Total Card */}
            <Card className="p-6 border border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam</p>
                  <p className="text-4xl font-bold text-foreground mt-2">
                    ₺{total.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ürün Sayısı:</span>
                    <span className="font-medium text-foreground">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  {/* KDV Checkbox */}
                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                      id="kdv-checkbox"
                      checked={includeKdv}
                      onCheckedChange={(checked) => setIncludeKdv(checked as boolean)}
                    />
                    <label htmlFor="kdv-checkbox" className="text-sm text-muted-foreground cursor-pointer">
                      KDV Dahil (%20)
                    </label>
                  </div>

                  {includeKdv && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">KDV (%20):</span>
                      <span className="font-medium text-foreground">
                        ₺{(total * KDV_RATE).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/30">
                    <span className="text-foreground">
                      {includeKdv ? "Toplam + KDV" : "Toplam"}
                    </span>
                    <span className="text-foreground">
                      ₺{(total * (includeKdv ? 1 + KDV_RATE : 1)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCompleteSale}
                  disabled={cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold gap-2 h-12 text-base"
                >
                  <Check className="w-5 h-5" />
                  Satışı Tamamla
                </Button>
              </div>
            </Card>

            {/* Recent Sales */}
            <Card className="p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3">Son Satışlar</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {completedSales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="p-2 bg-muted/30 rounded text-sm border border-border/30"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">
                        {sale.items.length} ürün
                      </span>
                      <span className="text-foreground font-semibold">
                        ₺{sale.total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(sale.date).toLocaleTimeString("tr-TR")}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
