/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * User Types
 */
export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  company: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  company: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
}

/**
 * Auth Responses
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: UserPublic;
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  company: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: UserPublic;
  message: string;
}

/**
 * Stock Types
 */
export interface StockItem {
  id: string;
  userId: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  minQuantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockOperation {
  id: string;
  stockId: string;
  userId: string;
  operationType: "add" | "remove" | "transfer";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
}

/**
 * Admin Types
 */
export interface AdminGetUsersResponse {
  success: boolean;
  users: UserPublic[];
  total: number;
}

export interface AdminUpdateUserRequest {
  role?: UserRole;
  isActive?: boolean;
  company?: string;
}

export interface AdminDeleteUserRequest {
  userId: string;
}

/**
 * Stock Report Types
 */
export interface StockReport {
  userId: string;
  username: string;
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  operations: StockOperation[];
}
