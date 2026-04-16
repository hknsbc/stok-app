import { RequestHandler } from "express";
import { StockItem, StockOperation } from "@shared/api";
import { getStocksByUserId, getStockById, createStock, updateStock, deleteStock, addStockOperation, getStockOperationsByUserId } from "../database";

export const handleGetUserStocks: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) { res.status(401).json({ success: false, message: "Yetkisiz erişim" }); return; }
  const stocks = await getStocksByUserId(userId);
  res.json({ success: true, stocks, total: stocks.length });
};

export const handleCreateStock: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) { res.status(401).json({ success: false, message: "Yetkisiz erişim" }); return; }
  const { name, sku, quantity, unit, unitPrice, minQuantity, category } = req.body;
  if (!name || !sku || quantity === undefined || !unit) {
    res.status(400).json({ success: false, message: "Zorunlu alanlar eksik" }); return;
  }
  const stockId = `stock_${Date.now()}`;
  const newStock: StockItem = {
    id: stockId, userId, name, sku,
    quantity: parseInt(quantity), unit,
    unitPrice: parseFloat(unitPrice || 0),
    minQuantity: parseInt(minQuantity || 0),
    category: category || "Diğer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (await createStock(newStock)) {
    const operation: StockOperation = {
      id: `op_${Date.now()}`, stockId, userId, operationType: "add",
      quantity: newStock.quantity, previousQuantity: 0, newQuantity: newStock.quantity,
      reason: "İlk ürün ekleme", createdAt: new Date().toISOString(),
    };
    await addStockOperation(operation);
    res.json({ success: true, stock: newStock, message: "Stok başarıyla oluşturuldu" });
  } else {
    res.status(400).json({ success: false, message: "Stok oluşturulamadı" });
  }
};

export const handleUpdateStockQuantity: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) { res.status(401).json({ success: false, message: "Yetkisiz erişim" }); return; }
  const stockId = req.params.stockId as string;
  const { quantity, reason, operationType } = req.body;
  if (quantity === undefined) { res.status(400).json({ success: false, message: "Miktar gereklidir" }); return; }
  const stock = await getStockById(stockId);
  if (!stock || stock.userId !== userId) {
    res.status(403).json({ success: false, message: "Bu stoka erişim yetkiniz yok" }); return;
  }
  const previousQuantity = stock.quantity;
  let newQuantity: number;
  if (operationType === "add") {
    newQuantity = previousQuantity + parseInt(quantity);
  } else if (operationType === "remove") {
    newQuantity = previousQuantity - parseInt(quantity);
    if (newQuantity < 0) { res.status(400).json({ success: false, message: "Yetersiz stok" }); return; }
  } else {
    newQuantity = parseInt(quantity);
  }
  if (await updateStock(stockId, { quantity: newQuantity })) {
    const operation: StockOperation = {
      id: `op_${Date.now()}`, stockId, userId,
      operationType: (operationType || "transfer") as any,
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity, newQuantity,
      reason: reason || "Stok güncelleme", createdAt: new Date().toISOString(),
    };
    await addStockOperation(operation);
    res.json({ success: true, stock: await getStockById(stockId), message: "Stok başarıyla güncellendi" });
  } else {
    res.status(400).json({ success: false, message: "Stok güncellenemedi" });
  }
};

export const handleDeleteStock: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) { res.status(401).json({ success: false, message: "Yetkisiz erişim" }); return; }
  const stockId = req.params.stockId as string;
  const stock = await getStockById(stockId);
  if (!stock || stock.userId !== userId) {
    res.status(403).json({ success: false, message: "Bu stoka erişim yetkiniz yok" }); return;
  }
  if (await deleteStock(stockId)) {
    res.json({ success: true, message: "Stok başarıyla silindi" });
  } else {
    res.status(400).json({ success: false, message: "Stok silinemedi" });
  }
};

export const handleGetStockOperations: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) { res.status(401).json({ success: false, message: "Yetkisiz erişim" }); return; }
  const operations = await getStockOperationsByUserId(userId);
  res.json({ success: true, operations, total: operations.length });
};
