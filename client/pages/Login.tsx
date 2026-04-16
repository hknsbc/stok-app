import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username, password);
    if (success) {
      navigate("/");
    } else {
      setError("Geçersiz kullanıcı adı veya şifre");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md px-4 py-8 animate-fade-in">
        <div className="bg-card rounded-xl shadow-2xl border border-border/50 backdrop-blur-sm p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Stok Takip</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Envanter Yönetim Sistemi
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Kullanıcı Adı
              </label>
              <Input
                type="text"
                placeholder="Kullanıcı adınızı giriniz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
                className="bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Şifre
              </label>
              <Input
                type="password"
                placeholder="Şifrenizi giriniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold h-10 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-blue-600">Demo Giriş Bilgileri:</p>
            <p className="text-xs text-blue-600">
              <span className="font-medium">Admin:</span> hakans / 552834
            </p>
            <p className="text-xs text-blue-600">
              <span className="font-medium">Kullanıcı:</span> demo / demo123
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-center text-muted-foreground">
              Lütfen doğru kullanıcı adı ve şifreyi girin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
