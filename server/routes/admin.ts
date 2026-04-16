import { RequestHandler } from "express";
import { UserPublic, AdminUpdateUserRequest } from "@shared/api";
import { getAllUsers, getUserById, updateUser, deleteUser, getStocksByUserId, getStockOperationsByUserId, createUser } from "../database";

const toPublic = (u: any): UserPublic => ({
  id: u.id, username: u.username, email: u.email,
  role: u.role, company: u.company, createdAt: u.createdAt,
  isActive: u.isActive, lastLogin: u.lastLogin,
});

export const handleGetAllUsers: RequestHandler = async (req, res) => {
  if ((req as any).userRole !== "admin") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(403).json({ success: false, message: "Yetkisiz erişim" }); return;
  }
  const users = await getAllUsers();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json({ success: true, users: users.map(toPublic), total: users.length });
};

export const handleGetUserDetail: RequestHandler = async (req, res) => {
  if ((req as any).userRole !== "admin") {
    res.status(403).json({ success: false, message: "Yetkisiz erişim" }); return;
  }
  const userId = req.params.userId as string;
  const user = await getUserById(userId);
  if (!user) { res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" }); return; }
  const [stocks, operations] = await Promise.all([
    getStocksByUserId(userId),
    getStockOperationsByUserId(userId),
  ]);
  res.json({
    success: true, user: toPublic(user), stocks, operations,
    totalStocks: stocks.length,
    totalValue: stocks.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0),
  });
};

export const handleUpdateUser: RequestHandler = async (req, res) => {
  if ((req as any).userRole !== "admin") {
    res.status(403).json({ success: false, message: "Yetkisiz erişim" }); return;
  }
  const userId = req.params.userId as string;
  const updates = req.body as AdminUpdateUserRequest;
  const user = await getUserById(userId);
  if (!user) { res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" }); return; }
  if (userId === "hakans" && updates.role !== "admin") {
    res.status(400).json({ success: false, message: "Admin hesabın rolü değiştirilemez" }); return;
  }
  if (await updateUser(userId, updates)) {
    const updated = await getUserById(userId);
    res.json({ success: true, user: toPublic(updated!), message: "Kullanıcı başarıyla güncellendi" });
  } else {
    res.status(400).json({ success: false, message: "Kullanıcı güncellenemedi" });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  if ((req as any).userRole !== "admin") {
    res.status(403).json({ success: false, message: "Yetkisiz erişim" }); return;
  }
  const userId = req.params.userId as string;
  if (userId === "hakans") {
    res.status(400).json({ success: false, message: "Admin hesabı silinemez" }); return;
  }
  if (await deleteUser(userId)) {
    res.json({ success: true, message: "Kullanıcı başarıyla silindi" });
  } else {
    res.status(400).json({ success: false, message: "Kullanıcı silinemedi" });
  }
};

export const handleGetAdminStats: RequestHandler = async (req, res) => {
  if ((req as any).userRole !== "admin") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(403).json({ success: false, message: "Yetkisiz erişim" }); return;
  }
  const users = await getAllUsers();
  let totalStocks = 0;
  let totalValue = 0;
  for (const user of users) {
    const stocks = await getStocksByUserId(user.id);
    totalStocks += stocks.length;
    totalValue += stocks.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      adminUsers: users.filter(u => u.role === "admin").length,
      inactiveUsers: users.filter(u => !u.isActive).length,
      totalStocks,
      totalInventoryValue: totalValue,
    },
  });
};

export const handleCreateUserAsAdmin: RequestHandler = async (req, res) => {
  if ((req as any).userRole !== "admin") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(403).json({ success: false, message: "Yetkisiz erişim" }); return;
  }
  const { username, email, password, company, role } = req.body;
  if (!username || !email || !password || !company) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(400).json({ success: false, message: "Tüm alanlar gereklidir" }); return;
  }
  if (username.length < 3) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(400).json({ success: false, message: "Kullanıcı adı en az 3 karakter olmalıdır" }); return;
  }
  if (password.length < 6) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(400).json({ success: false, message: "Şifre en az 6 karakter olmalıdır" }); return;
  }
  if (await getUserById(username)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(400).json({ success: false, message: "Bu kullanıcı adı zaten kullanılıyor" }); return;
  }
  const newUser = {
    id: username, username, email, password,
    role: (role || "user") as "admin" | "user",
    company, createdAt: new Date().toISOString(), isActive: true,
  };
  if (await createUser(newUser)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ success: true, user: toPublic(newUser), message: "Kullanıcı başarıyla oluşturuldu" });
  } else {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(400).json({ success: false, message: "Kullanıcı oluşturulamadı" });
  }
};
