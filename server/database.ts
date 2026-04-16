import { User, StockItem, StockOperation } from "@shared/api";
import { supabase } from "./supabase";

// ── KULLANICI İŞLEMLERİ ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    role: row.role,
    company: row.company,
    createdAt: row.created_at,
    isActive: row.is_active,
    lastLogin: row.last_login,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStock(row: any): StockItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    sku: row.sku,
    quantity: row.quantity,
    unit: row.unit,
    unitPrice: row.unit_price,
    minQuantity: row.min_quantity,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOperation(row: any): StockOperation {
  return {
    id: row.id,
    stockId: row.stock_id,
    userId: row.user_id,
    operationType: row.operation_type,
    quantity: row.quantity,
    previousQuantity: row.previous_quantity,
    newQuantity: row.new_quantity,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data } = await supabase.from("users").select("*").eq("id", id).single();
  return data ? mapUser(data) : undefined;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const { data } = await supabase.from("users").select("*").eq("username", username).single();
  return data ? mapUser(data) : undefined;
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapUser);
}

export async function createUser(user: User): Promise<boolean> {
  const { error } = await supabase.from("users").insert({
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    role: user.role,
    company: user.company,
    is_active: user.isActive,
    created_at: user.createdAt,
  });
  if (error) console.error("[DB] createUser error:", error.message);
  return !error;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const patch: Record<string, unknown> = {};
  if (updates.password !== undefined) patch.password = updates.password;
  if (updates.role !== undefined) patch.role = updates.role;
  if (updates.company !== undefined) patch.company = updates.company;
  if (updates.isActive !== undefined) patch.is_active = updates.isActive;
  if (updates.lastLogin !== undefined) patch.last_login = updates.lastLogin;
  if (updates.email !== undefined) patch.email = updates.email;
  const { error } = await supabase.from("users").update(patch).eq("id", id);
  return !error;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (id === "hakans") return false;
  await supabase.from("stocks").delete().eq("user_id", id);
  const { error } = await supabase.from("users").delete().eq("id", id);
  return !error;
}

// ── STOK İŞLEMLERİ ──────────────────────────────────────────────────────────

export async function getStocksByUserId(userId: string): Promise<StockItem[]> {
  const { data } = await supabase.from("stocks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return (data ?? []).map(mapStock);
}

export async function getStockById(id: string): Promise<StockItem | undefined> {
  const { data } = await supabase.from("stocks").select("*").eq("id", id).single();
  return data ? mapStock(data) : undefined;
}

export async function createStock(stock: StockItem): Promise<boolean> {
  const { error } = await supabase.from("stocks").insert({
    id: stock.id,
    user_id: stock.userId,
    name: stock.name,
    sku: stock.sku,
    quantity: stock.quantity,
    unit: stock.unit,
    unit_price: stock.unitPrice,
    min_quantity: stock.minQuantity,
    category: stock.category,
    created_at: stock.createdAt,
    updated_at: stock.updatedAt,
  });
  if (error) console.error("[DB] createStock error:", error.message);
  return !error;
}

export async function updateStock(id: string, updates: Partial<StockItem>): Promise<boolean> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.sku !== undefined) patch.sku = updates.sku;
  if (updates.quantity !== undefined) patch.quantity = updates.quantity;
  if (updates.unit !== undefined) patch.unit = updates.unit;
  if (updates.unitPrice !== undefined) patch.unit_price = updates.unitPrice;
  if (updates.minQuantity !== undefined) patch.min_quantity = updates.minQuantity;
  if (updates.category !== undefined) patch.category = updates.category;
  const { error } = await supabase.from("stocks").update(patch).eq("id", id);
  return !error;
}

export async function deleteStock(id: string): Promise<boolean> {
  const { error } = await supabase.from("stocks").delete().eq("id", id);
  return !error;
}

// ── OPERASYON İŞLEMLERİ ─────────────────────────────────────────────────────

export async function addStockOperation(operation: StockOperation): Promise<void> {
  await supabase.from("stock_operations").insert({
    id: operation.id,
    stock_id: operation.stockId,
    user_id: operation.userId,
    operation_type: operation.operationType,
    quantity: operation.quantity,
    previous_quantity: operation.previousQuantity,
    new_quantity: operation.newQuantity,
    reason: operation.reason,
    created_at: operation.createdAt,
  });
}

export async function getStockOperations(stockId?: string): Promise<StockOperation[]> {
  let query = supabase.from("stock_operations").select("*").order("created_at", { ascending: false });
  if (stockId) query = query.eq("stock_id", stockId);
  const { data } = await query;
  return (data ?? []).map(mapOperation);
}

export async function getStockOperationsByUserId(userId: string): Promise<StockOperation[]> {
  const { data } = await supabase.from("stock_operations").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return (data ?? []).map(mapOperation);
}

// ── SESSION İŞLEMLERİ ────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const sessionId = Math.random().toString(36).substring(7) + Date.now();
  await supabase.from("sessions").insert({ id: sessionId, user_id: userId, created_at: new Date().toISOString() });
  return sessionId;
}

export async function getSessionUser(sessionId: string): Promise<string | undefined> {
  const { data } = await supabase.from("sessions").select("user_id").eq("id", sessionId).single();
  return data?.user_id ?? undefined;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  return !error;
}
