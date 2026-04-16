import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  type: "Müşteri" | "Tedarikçi";
  email: string;
  phone: string;
  city: string;
  taxId: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "ABC İşletmeleri",
    type: "Müşteri",
    email: "info@abc.com.tr",
    phone: "0212 555 1234",
    city: "İstanbul",
    taxId: "1234567890",
  },
  {
    id: "2",
    name: "XYZ Ltd. Şti.",
    type: "Tedarikçi",
    email: "sales@xyz.com.tr",
    phone: "0216 777 5678",
    city: "Ankara",
    taxId: "0987654321",
  },
  {
    id: "3",
    name: "Ticari A.Ş.",
    type: "Müşteri",
    email: "contact@ticari.com.tr",
    phone: "0232 999 2222",
    city: "İzmir",
    taxId: "1111111111",
  },
];

export default function Customers() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Cari Kartları
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Müşteri ve tedarikçi bilgilerini yönetin
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Yeni Cari Kartı
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari adı veya e-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
        </Card>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="p-5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {customer.name}
                    </h3>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-2 ${
                        customer.type === "Müşteri"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {customer.type}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{customer.city}</span>
                  </div>
                </div>

                {/* Tax ID */}
                <div className="bg-muted/30 rounded p-2 text-xs">
                  <p className="text-muted-foreground">Vergi Numarası</p>
                  <p className="font-mono font-semibold text-foreground">
                    {customer.taxId}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-primary hover:bg-primary/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="p-12 border border-border/50 text-center">
            <p className="text-muted-foreground">Kayıt bulunamadı</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
