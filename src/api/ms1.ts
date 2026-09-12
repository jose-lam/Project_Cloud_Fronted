import { ms1Client } from "./client";
import type { Category, PaginatedResult, PaginationParams, Product, StockInfo, Warehouse } from "../types";

// MS1 — Catálogo e Inventario (Categorías, Productos, Inventario/Almacén)
// VITE_MS1_URL ya incluye el prefijo /ms1; las rutas son relativas a esa base.
// Repositorio: https://github.com/jose-lam/Cloud_backend_ms1

// MS1 serializa sus campos decimales como texto; la UI trabaja con números.
type ProductResponse = {
  [K in keyof Product]: K extends "price" | "stars" ? Product[K] | string : Product[K];
};

function normalizeProduct(product: ProductResponse): Product {
  return {
    ...product,
    price: Number(product.price),
    stars: product.stars === undefined ? undefined : Number(product.stars),
  };
}

function normalizeProducts(result: PaginatedResult<ProductResponse>): PaginatedResult<Product> {
  return { ...result, data: result.data.map(normalizeProduct) };
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await ms1Client.get<Category[]>("/categories");
  return data;
}

export async function getProducts({ page = 1, limit = 20 }: PaginationParams = {}): Promise<
  PaginatedResult<Product>
> {
  const { data } = await ms1Client.get<PaginatedResult<ProductResponse>>("/products", {
    params: { page, limit },
  });
  return normalizeProducts(data);
}

export async function getProductById(productId: string | number): Promise<Product> {
  const { data } = await ms1Client.get<ProductResponse>(`/products/${productId}`);
  return normalizeProduct(data);
}

export async function getProductsByCategory(
  categoryId: string | number,
  { page = 1, limit = 20 }: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const { data } = await ms1Client.get<PaginatedResult<ProductResponse>>(`/products/category/${categoryId}`, {
    params: { page, limit },
  });
  return normalizeProducts(data);
}

export async function searchProductsByName(
  name: string,
  { page = 1, limit = 20 }: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const { data } = await ms1Client.get<PaginatedResult<ProductResponse>>("/products/search/by-name", {
    params: { name, page, limit },
  });
  return normalizeProducts(data);
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
  const { data } = await ms1Client.get<PaginatedResult<ProductResponse>>("/products/filter/by-price", {
    params: { min_price: minPrice, max_price: maxPrice, page, limit },
  });
  return normalizeProducts(data);
}

export interface GetAvailableStockParams {
  productId: string | number;
  clientId: string | number;
}

export async function getAvailableStock({ productId, clientId }: GetAvailableStockParams): Promise<StockInfo> {
  const { data } = await ms1Client.get<StockInfo>("/stock/available", {
    params: { product_id: productId, client_id: clientId },
  });
  return data; // { product_id, client_id, client_country, available_stock }
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const { data } = await ms1Client.get<Warehouse[]>("/warehouses");
  return data;
}
