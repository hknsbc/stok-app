import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserPublic } from "@shared/api";

interface AuthContextType {
  user: UserPublic | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    company: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/current", {
          credentials: "include",
        });

        if (response.ok) {
          // Check content-type FIRST
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.error(
              "[Auth] /api/auth/current returned non-JSON response. Content-Type:",
              contentType
            );
            const text = await response.text();
            console.error(
              "[Auth] Response body (first 500 chars):",
              text.substring(0, 500)
            );
            setIsLoading(false);
            return;
          }

          const text = await response.text();
          // Check if response is valid JSON
          if (text && text.trim()) {
            try {
              const data = JSON.parse(text);
              if (data.success && data.userId) {
                // For now, just set a basic user object
                // In a real app, you'd fetch full user details here
                setUser({
                  id: data.userId,
                  username: localStorage.getItem("username") || "Kullanıcı",
                  email: "",
                  role: (localStorage.getItem("userRole") as "admin" | "user") || "user",
                  company: "",
                  createdAt: new Date().toISOString(),
                  isActive: true,
                });
              }
            } catch (parseError) {
              console.error("[Auth] Failed to parse auth response:", parseError);
            }
          }
        }
      } catch (error) {
        // Silently fail - user is not logged in
        console.debug("[Auth] User not logged in:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error("Login failed with status:", response.status);
        return false;
      }

      // Check content-type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "Auth endpoint returned non-JSON response. Content-Type:",
          contentType
        );
        const text = await response.text();
        console.error("Response body (first 500 chars):", text.substring(0, 500));
        return false;
      }

      const text = await response.text();
      if (!text) {
        console.error("Empty response from login endpoint");
        return false;
      }

      try {
        const data = JSON.parse(text);
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userRole", data.user.role);
          return true;
        } else {
          console.error("Login response missing success or user:", data);
          return false;
        }
      } catch (parseError) {
        console.error("Failed to parse login response:", text);
        return false;
      }
    } catch (error) {
      console.error("Login request failed:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    company: string
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password, company }),
      });

      if (!response.ok) {
        console.error("Register failed with status:", response.status);
        return false;
      }

      // Check content-type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "Auth endpoint returned non-JSON response. Content-Type:",
          contentType
        );
        const text = await response.text();
        console.error("Response body (first 500 chars):", text.substring(0, 500));
        return false;
      }

      const text = await response.text();
      if (!text) {
        console.error("Empty response from register endpoint");
        return false;
      }

      try {
        const data = JSON.parse(text);
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userRole", data.user.role);
          return true;
        } else {
          console.error("Register response missing success or user:", data);
          return false;
        }
      } catch (parseError) {
        console.error("Failed to parse register response:", text);
        return false;
      }
    } catch (error) {
      console.error("Register request failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
