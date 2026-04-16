import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Zap,
  AlertCircle,
} from "lucide-react";

// Mock data for daily sales
const dailySalesData = [
  { date: "2024-01-20", sales: 2500, transactions: 8 },
  { date: "2024-01-21", sales: 3200, transactions: 12 },
  { date: "2024-01-22", sales: 2800, transactions: 10 },
  { date: "2024-01-23", sales: 4100, transactions: 15 },
  { date: "2024-01-24", sales: 3500, transactions: 13 },
  { date: "2024-01-25", sales: 5200, transactions: 18 },
  { date: "2024-01-26", sales: 4800, transactions: 16 },
];

// Mock data for weekly sales
const weeklySalesData = [
  { week: "Hafta 1", startDate: "2024-01-01", sales: 18500, expenses: 6200, transactions: 68 },
  { week: "Hafta 2", startDate: "2024-01-08", sales: 22300, expenses: 7100, transactions: 82 },
  { week: "Hafta 3", startDate: "2024-01-15", sales: 25900, expenses: 7800, transactions: 95 },
  { week: "Hafta 4", startDate: "2024-01-22", sales: 26200, expenses: 8300, transactions: 98 },
];

// Mock data for monthly sales
const monthlySalesData = [
  { month: "Ocak 2024", sales: 92900, expenses: 29400, profit: 63500 },
  { month: "Aralık 2023", sales: 85400, expenses: 27200, profit: 58200 },
  { month: "Kasım 2023", sales: 78900, expenses: 25100, profit: 53800 },
  { month: "Ekim 2023", sales: 81200, expenses: 26000, profit: 55200 },
];

// Expense categories
const expenseCategories = [
  { category: "Elektrik", amount: 8200, percentage: 28 },
  { category: "Kiralama", amount: 7500, percentage: 25 },
  { category: "İnsan Kaynakları", amount: 6300, percentage: 21 },
  { category: "Pazarlama", amount: 4200, percentage: 14 },
  { category: "Diğer", amount: 3200, percentage: 12 },
];

const reports = [
  {
    id: "1",
    title: "Stok Raporu",
    description: "Mevcut stok seviyelerinin detaylı analizi",
    icon: Package,
    color: "from-blue-500 to-cyan-500",
    lastUpdated: "2024-01-25",
  },
  {
    id: "2",
    title: "Kar-Zarar Raporu",
    description: "Aylık gelir ve gider analizi",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    lastUpdated: "2024-01-25",
  },
  {
    id: "3",
    title: "İşletme Raporu",
    description: "Genel işletme performans metrikleri",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    lastUpdated: "2024-01-25",
  },
];

const currentMonthMetrics = {
  totalSales: 92900,
  totalExpenses: 29400,
  netProfit: 63500,
  profitMargin: 68.4,
  transactionCount: 275,
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly" | "expenses">("daily");

  const dailyAverage = (dailySalesData.reduce((sum, d) => sum + d.sales, 0) / dailySalesData.length).toFixed(2);
  const weeklyAverage = (weeklySalesData.reduce((sum, w) => sum + w.sales, 0) / weeklySalesData.length).toFixed(2);
  const monthlyAverage = (monthlySalesData.reduce((sum, m) => sum + m.sales, 0) / monthlySalesData.length).toFixed(2);
  const totalExpenses = expenseCategories.reduce((sum, e) => sum + e.amount, 0);
  const avgProfitMargin = (monthlySalesData.reduce((sum, m) => sum + (m.profit / m.sales) * 100, 0) / monthlySalesData.length).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Raporlar</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detaylı satış, masraf ve kar/zarar analizi
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-border/50 text-foreground"
            >
              <Filter className="w-4 h-4" />
              Filtre
            </Button>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Satış</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              ₺{currentMonthMetrics.totalSales.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-green-600 mt-1">Bu ay</p>
          </Card>

          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Masraf</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ₺{currentMonthMetrics.totalExpenses.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{currentMonthMetrics.totalExpenses.toFixed(0)} TL harcama</p>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <p className="text-sm text-muted-foreground">Net Kar</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ₺{currentMonthMetrics.netProfit.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-green-600 mt-1">↑ Karlı dönem</p>
          </Card>

          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Kar Marjı</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {currentMonthMetrics.profitMargin}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Satışların yüzdesi</p>
          </Card>

          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">İşlem Sayısı</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {currentMonthMetrics.transactionCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bu ay</p>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border/30">
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "daily"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Günlük Satışlar
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "weekly"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Haftalık Satışlar
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "monthly"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Aylık Satışlar
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              activeTab === "expenses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Masraflar
          </button>
        </div>

        {/* Daily Sales Tab */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Günlük Ortalama Satış</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ₺{parseFloat(dailyAverage).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">En Yüksek Satış Günü</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₺{Math.max(...dailySalesData.map(d => d.sales)).toLocaleString("tr-TR")}
                </p>
              </Card>
            </div>

            <Card className="border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/30">
                <h3 className="font-semibold text-foreground">Son 7 Günün Satışları</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Tarih</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Satış Tutarı</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">İşlem Sayısı</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Ortalama İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {dailySalesData.map((day, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {new Date(day.date).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-foreground">
                          ₺{day.sales.toLocaleString("tr-TR")}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">
                          {day.transactions}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">
                          ₺{(day.sales / day.transactions).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Weekly Sales Tab */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Haftalık Ortalama Satış</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ₺{parseFloat(weeklyAverage).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">En Yüksek Hafta</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₺{Math.max(...weeklySalesData.map(w => w.sales)).toLocaleString("tr-TR")}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Ortalama Haftalık Masraf</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  ₺{(weeklySalesData.reduce((s, w) => s + w.expenses, 0) / weeklySalesData.length).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </p>
              </Card>
            </div>

            <Card className="border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/30">
                <h3 className="font-semibold text-foreground">Son 4 Haftanın Satış ve Masraflı Analizi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Hafta</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Satış</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Masraf</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Net Kar</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Kar Marjı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {weeklySalesData.map((week, idx) => {
                      const profit = week.sales - week.expenses;
                      const margin = ((profit / week.sales) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium text-foreground">{week.week}</td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            ₺{week.sales.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-red-600">
                            ₺{week.expenses.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground">
                            ₺{profit.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-semibold">
                              {margin}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Monthly Sales Tab */}
        {activeTab === "monthly" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Aylık Ortalama Satış</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ₺{parseFloat(monthlyAverage).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">En Yüksek Ay</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₺{Math.max(...monthlySalesData.map(m => m.sales)).toLocaleString("tr-TR")}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Ortalama Kar Marjı</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {avgProfitMargin}%
                </p>
              </Card>
            </div>

            <Card className="border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/30">
                <h3 className="font-semibold text-foreground">Son 4 Ayın Kar/Zarar Analizi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Ay</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Toplam Satış</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Toplam Masraf</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Net Kar</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Kar Marjı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {monthlySalesData.map((month, idx) => {
                      const margin = ((month.profit / month.sales) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium text-foreground">{month.month}</td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            ₺{month.sales.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-red-600">
                            ₺{month.expenses.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-foreground">
                            ₺{month.profit.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-semibold">
                              {margin}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Toplam Aylık Masraf</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  ₺{totalExpenses.toLocaleString("tr-TR")}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">En Büyük Harcama Kalemi</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {expenseCategories[0].category}
                </p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Satışlara Oranı</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {((totalExpenses / currentMonthMetrics.totalSales) * 100).toFixed(1)}%
                </p>
              </Card>
            </div>

            {/* Expense Categories */}
            <Card className="p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-6">Masraf Dağılımı</h3>
              <div className="space-y-4">
                {expenseCategories.map((expense, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{expense.category}</p>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₺{expense.amount.toLocaleString("tr-TR")}
                        </p>
                        <p className="text-xs text-muted-foreground">{expense.percentage}% toplam</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${expense.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Expense Details Table */}
            <Card className="border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/30">
                <h3 className="font-semibold text-foreground">Masraf Kategorileri</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Kategori</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Tutar</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Yüzdesi</th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">Günlük Ortalama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {expenseCategories.map((expense, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium text-foreground">{expense.category}</td>
                        <td className="px-6 py-4 text-right font-semibold text-red-600">
                          ₺{expense.amount.toLocaleString("tr-TR")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded text-xs font-semibold">
                            {expense.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">
                          ₺{(expense.amount / 30).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-semibold">
                      <td className="px-6 py-4 text-foreground">TOPLAM</td>
                      <td className="px-6 py-4 text-right text-red-600">
                        ₺{totalExpenses.toLocaleString("tr-TR")}
                      </td>
                      <td className="px-6 py-4 text-right text-foreground">100%</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        ₺{(totalExpenses / 30).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Report Cards */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">Özel Raporlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;

              return (
                <Card
                  key={report.id}
                  className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br ${report.color}`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        {report.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-3">
                        Son güncelleme:{" "}
                        {new Date(report.lastUpdated).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground text-sm"
                        >
                          Görüntüle
                        </Button>
                        <Button
                          variant="outline"
                          className="text-primary hover:bg-primary/10 border-border/50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
