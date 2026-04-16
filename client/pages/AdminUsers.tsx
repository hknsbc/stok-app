import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Edit2,
  Trash2,
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { UserPublic } from "@shared/api";
import { Navigate } from "react-router-dom";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPublic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    company: "",
    role: "user",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Check if user is admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      // Check content-type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[AdminUsers] Non-JSON response from GET /api/admin/users. Status:", response.status);
        setLoading(false);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error("[AdminUsers] Empty response from GET /api/admin/users");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        console.error("[AdminUsers] API returned success: false", data.message);
      }
    } catch (error) {
      console.error("[AdminUsers] Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
      });

      // Check content-type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[AdminUsers] Non-JSON response from GET /api/admin/stats. Status:", response.status);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error("[AdminUsers] Empty response from GET /api/admin/stats");
        return;
      }

      const data = JSON.parse(text);
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error("[AdminUsers] Stats API returned success: false", data.message);
      }
    } catch (error) {
      console.error("[AdminUsers] Failed to fetch stats:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = users.filter(
      (u) =>
        u.username.toLowerCase().includes(term.toLowerCase()) ||
        u.email.toLowerCase().includes(term.toLowerCase()) ||
        u.company.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreateLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      // Check response status and content-type
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("[AdminUsers] Non-JSON response from POST /api/admin/users");
          setCreateError("Sunucu hatası: Geçersiz yanıt");
          return;
        }
      }

      const text = await response.text();
      if (!text) {
        console.error("[AdminUsers] Empty response from POST /api/admin/users");
        setCreateError("Sunucu hatası: Boş yanıt");
        return;
      }

      const data = JSON.parse(text);

      if (data.success) {
        setCreateSuccess("Kullanıcı başarıyla oluşturuldu!");
        setFormData({
          username: "",
          email: "",
          password: "",
          company: "",
          role: "user",
        });
        fetchUsers();
        fetchStats();
        setTimeout(() => {
          setShowCreateForm(false);
          setCreateSuccess("");
        }, 2000);
      } else {
        setCreateError(data.message || "Kullanıcı oluşturulamadı");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      setCreateError("Sunucu hatası oluştu");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === "hakans") {
      alert("Admin hesabı silinemez");
      return;
    }

    if (confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          fetchUsers();
          fetchStats();
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

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
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Kullanıcı Yönetimi
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tüm kullanıcıları yönetin ve yeni kullanıcı oluşturun
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Kullanıcı
          </Button>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <Card className="p-6 border border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Yeni Kullanıcı Oluştur
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError("");
                  setCreateSuccess("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <p className="text-sm text-red-600">{createError}</p>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                <p className="text-sm text-green-600">{createSuccess}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Kullanıcı Adı *
                  </label>
                  <Input
                    type="text"
                    placeholder="Örn: user123"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={createLoading}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    E-posta *
                  </label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={createLoading}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Şifre *
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={createLoading}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Şirket Adı *
                  </label>
                  <Input
                    type="text"
                    placeholder="Şirket veya İşletme Adı"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    disabled={createLoading}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Kullanıcı Rolü
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={createLoading}
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-foreground"
                >
                  <option value="user">Normal Kullanıcı</option>
                  <option value="admin">Admin Kullanıcı</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createLoading || !formData.username || !formData.email || !formData.password || !formData.company}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                >
                  {createLoading ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateError("");
                    setCreateSuccess("");
                  }}
                  variant="outline"
                  className="flex-1 border-border/50"
                >
                  İptal
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {stats.totalUsers}
            </p>
          </Card>
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Aktif Kullanıcılar</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.activeUsers}
            </p>
          </Card>
          <Card className="p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Admin Kullanıcıları</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats.adminUsers}
            </p>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Kullanıcı adı, e-posta veya şirket adı ile ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
        </Card>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Card className="border border-border/50">
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border/30">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Kullanıcı Adı
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      E-posta
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Şirket
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">
                      Son Giriş
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-foreground">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {u.username}
                        {u.username === "hakans" && (
                          <span className="ml-2 text-xs px-2 py-1 bg-purple-500/10 text-purple-600 rounded font-semibold">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {u.company}
                      </td>
                      <td className="px-6 py-4">
                        {u.role === "admin" ? (
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded text-xs font-semibold">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs font-semibold">
                            Kullanıcı
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <XCircle className="w-4 h-4" />
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString("tr-TR")
                          : "Hiç giriş yapmadı"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleUserStatus(u.id, u.isActive)
                            }
                            disabled={u.username === "hakans"}
                            className={
                              u.isActive
                                ? "text-orange-600 hover:bg-orange-500/10"
                                : "text-green-600 hover:bg-green-500/10"
                            }
                            title={
                              u.isActive ? "Deaktif Et" : "Aktif Et"
                            }
                          >
                            {u.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={u.username === "hakans"}
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 border border-border/50 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
