import { ms1Client } from "./client";
import type { Category, PaginatedResult, PaginationParams, Product, StockInfo, Warehouse } from "../types";

// MS1 — Catálogo e Inventario (Categorías, Productos, Inventario/Almacén)
// Repositorio: https://github.com/jose-lam/Cloud_backend_ms1

export async function getCategories(): Promise<Category[]> {
  const { data } = await ms1Client.get<Category[]>("/ms1/categories");
  return data;
}

export async function getProducts({ page = 1, limit = 20 }: PaginationParams = {}): Promise<
  PaginatedResult<Product>
> {
  const { data } = await ms1Client.get<PaginatedResult<Product>>("/ms1/products", {
    params: { page, limit },
  });
  return data; // { total, page, limit, total_pages, data: [] }
}

export async function getProductById(productId: string | number): Promise<Product> {
  const { data } = await ms1Client.get<Product>(`/ms1/products/${productId}`);
  return data;
}

export async function getProductsByCategory(
  categoryId: string | number,
  { page = 1, limit = 20 }: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const { data } = await ms1Client.get<PaginatedResult<Product>>(`/ms1/products/category/${categoryId}`, {
    params: { page, limit },
  });
  return data;
}

export async function searchProductsByName(
  name: string,
  { page = 1, limit = 20 }: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const { data } = await ms1Client.get<PaginatedResult<Product>>("/ms1/products/search/by-name", {
    params: { name, page, limit },
  });
  return data;
}

export interface GetProductsByPriceParams extends PaginationParams {
  minPrice?: number;
  maxPrice?: number;
}

export async function getProductsByPrice({
  minPrice,
  maxPrice,
  page = 1,
  limit = 20,
}: GetProductsByPriceParams = {}): Promise<PaginatedResult<Product>> {
  const { data } = await ms1Client.get<PaginatedResult<Product>>("/ms1/products/filter/by-price", {
    params: { min_price: minPrice, max_price: maxPrice, page, limit },
  });
  return data;
}

export interface GetAvailableStockParams {
  productId: string | number;
  clientId: string | number;
}

export async function getAvailableStock({ productId, clientId }: GetAvailableStockParams): Promise<StockInfo> {
  const { data } = await ms1Client.get<StockInfo>("/ms1/stock/available", {
    params: { product_id: productId, client_id: clientId },
  });
  return data; // { product_id, client_id, client_country, available_stock }
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const { data } = await ms1Client.get<Warehouse[]>("/ms1/warehouses");
  return data;
}
