import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleRegister, handleLogout, handleGetCurrentUser } from "./routes/auth";
import { handleGetUserStocks, handleCreateStock, handleUpdateStockQuantity, handleDeleteStock, handleGetStockOperations } from "./routes/stock";
import { handleGetAllUsers, handleGetUserDetail, handleUpdateUser, handleDeleteUser, handleGetAdminStats, handleCreateUserAsAdmin } from "./routes/admin";
import { getSessionUser, getUserById } from "./database";

export function createServer() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Async auth middleware — Supabase'e sorgu attığı için async
  const authMiddleware = async (req: any, res: any, next: any) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      const userId = await getSessionUser(sessionId);
      if (userId) {
        const user = await getUserById(userId);
        if (user) {
          req.userId = userId;
          req.userRole = user.role;
          req.user = user;
        }
      }
    }
    next();
  };

  app.use(authMiddleware);

  app.use((req, _res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });

  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "pong" });
  });

  app.get("/api/demo", handleDemo);

  // Auth (public)
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/current", handleGetCurrentUser);

  // Stock (protected)
  app.get("/api/stocks", handleGetUserStocks);
  app.post("/api/stocks", handleCreateStock);
  app.put("/api/stocks/:stockId", handleUpdateStockQuantity);
  app.delete("/api/stocks/:stockId", handleDeleteStock);
  app.get("/api/stocks/operations", handleGetStockOperations);

  // Admin (protected, admin only)
  app.get("/api/admin/users", handleGetAllUsers);
  app.post("/api/admin/users", handleCreateUserAsAdmin);
  app.get("/api/admin/stats", handleGetAdminStats);
  app.get("/api/admin/users/:userId", handleGetUserDetail);
  app.put("/api/admin/users/:userId", handleUpdateUser);
  app.delete("/api/admin/users/:userId", handleDeleteUser);

  return app;
}
