import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@shared/api";
import { getUserByUsername, createUser, createSession, getSessionUser, deleteSession, updateUser } from "../database";

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as LoginRequest;
    if (!username || !password) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({ success: false, message: "Kullanıcı adı ve şifre gereklidir" } as LoginResponse);
    }
    const user = await getUserByUsername(username);
    if (!user || user.password !== password || !user.isActive) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({ success: false, message: "Geçersiz kullanıcı adı veya şifre" } as LoginResponse);
    }
    await updateUser(user.id, { lastLogin: new Date().toISOString() });
    const sessionId = await createSession(user.id);
    res.cookie("sessionId", sessionId, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, company: user.company, createdAt: user.createdAt, isActive: user.isActive, lastLogin: user.lastLogin },
    } as LoginResponse);
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(500).json({ success: false, message: "Sunucu hatası" } as LoginResponse);
  }
};

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { username, email, password, company } = req.body as RegisterRequest;
    if (!username || !email || !password || !company) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({ success: false, message: "Tüm alanlar gereklidir" } as RegisterResponse);
    }
    if (username.length < 3) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({ success: false, message: "Kullanıcı adı en az 3 karakter olmalıdır" } as RegisterResponse);
    }
    if (password.length < 6) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({ success: false, message: "Şifre en az 6 karakter olmalıdır" } as RegisterResponse);
    }
    if (await getUserByUsername(username)) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({ success: false, message: "Bu kullanıcı adı zaten kullanılıyor" } as RegisterResponse);
    }
    const userId = `user_${Date.now()}`;
    const newUser = { id: userId, username, email, password, role: "user" as const, company, createdAt: new Date().toISOString(), isActive: true };
    if (await createUser(newUser)) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({
        success: true,
        user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role, company: newUser.company, createdAt: newUser.createdAt, isActive: newUser.isActive },
        message: "Hesap başarıyla oluşturuldu",
      } as RegisterResponse);
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.json({ success: false, message: "Kullanıcı oluşturulamadı" } as RegisterResponse);
  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(500).json({ success: false, message: "Sunucu hatası" } as RegisterResponse);
  }
};

export const handleLogout: RequestHandler = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) await deleteSession(sessionId);
  res.clearCookie("sessionId");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json({ success: true, message: "Başarıyla çıkış yapılmıştır" });
};

export const handleGetCurrentUser: RequestHandler = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(401).json({ success: false, message: "Oturum bulunamadı" });
  }
  const userId = await getSessionUser(sessionId);
  if (!userId) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(401).json({ success: false, message: "Geçersiz oturum" });
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json({ success: true, userId });
};
