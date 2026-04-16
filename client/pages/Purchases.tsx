import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Download,
  Eye,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";

interface Purchase {
  id: string;
  invoiceNo: string;
  supplier: string;
  date: string;
  amount: number;
  status: "Beklemede" | "Alındı" | "İptal";
  itemCount: number;
  documentType: "İrsaliye" | "PDF" | "Diğer";
}

const mockPurchases: Purchase[] = [
  {
    id: "1",
    invoiceNo: "INV-2024-001",
    supplier: "XYZ Ltd. Şti.",
    date: "2024-01-15",
    amount: 25000,
    status: "Alındı",
    itemCount: 5,
    documentType: "İrsaliye",
  },
  {
    id: "2",
    invoiceNo: "INV-2024-002",
    supplier: "ABC İşletmeleri",
    date: "2024-01-20",
    amount: 15500,
    status: "Beklemede",
    itemCount: 3,
    documentType: "PDF",
  },
  {
    id: "3",
    invoiceNo: "INV-2024-003",
    supplier: "Ticari A.Ş.",
    date: "2024-01-25",
    amount: 8900,
    status: "Alındı",
    itemCount: 2,
    documentType: "İrsaliye",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Alındı":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "Beklemede":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "İptal":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/30";
  }
};

export default function Purchases() {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = purchases
    .filter((p) => p.status === "Alındı")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Alışlar</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Satın alma işlemlerini ve irsaliyelerini yönetin
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Yeni Alış Kaydı
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Alış</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ₺{totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alınan Alış</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₺{totalReceived.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam İşlem</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {purchases.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Fatura no veya tedarikçi adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
        </Card>

        {/* Purchases List */}
        <div className="space-y-3">
          {filteredPurchases.map((purchase) => (
            <Card
              key={purchase.id}
              className="p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {purchase.invoiceNo}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {purchase.supplier}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        purchase.status
                      )}`}
                    >
                      {purchase.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(purchase.date).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{purchase.documentType}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {purchase.itemCount} ürün
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    ₺{purchase.amount.toFixed(2)}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPurchases.length === 0 && (
          <Card className="p-12 border border-border/50 text-center">
            <p className="text-muted-foreground">Kayıt bulunamadı</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
