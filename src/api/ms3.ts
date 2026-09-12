import { ms3Client } from "./client";
import type { CartItem, Carrito, NuevoCarritoPayload } from "../types";

// MS3 — Carrito de Compras (NoSQL / MongoDB)
// Repositorio: https://github.com/jose-lam/Cloud_backend_ms3

export async function crearCarrito({
  idCliente,
  idAlmacen = null,
  moneda = "PEN",
}: NuevoCarritoPayload): Promise<Carrito> {
  const { data } = await ms3Client.post<Carrito>("/api/carritos", { idCliente, idAlmacen, moneda });
  return data;
}

export async function obtenerCarrito(id: string): Promise<Carrito> {
  const { data } = await ms3Client.get<Carrito>(`/api/carritos/${id}`);
  return data;
}

export async function obtenerCarritoActivoPorCliente(clienteId: string): Promise<Carrito> {
  const { data } = await ms3Client.get<Carrito>(`/api/carritos/cliente/${clienteId}`);
  return data;
}

export async function agregarItem(carritoId: string, item: CartItem): Promise<Carrito> {
  // item: { idProducto, nombre, precioUnitario, urlImagen, urlProducto, cantidad }
  const { data } = await ms3Client.post<Carrito>(`/api/carritos/${carritoId}/items`, item);
  return data;
}

export async function actualizarCantidad(
  carritoId: string,
  productoId: string | number,
  cantidad: number
): Promise<Carrito> {
  const { data } = await ms3Client.patch<Carrito>(`/api/carritos/${carritoId}/items/${productoId}`, {
    cantidad,
  });
  return data;
}

export async function eliminarItem(carritoId: string, productoId: string | number): Promise<Carrito> {
  const { data } = await ms3Client.delete<Carrito>(`/api/carritos/${carritoId}/items/${productoId}`);
  return data;
}

export async function vaciarCarrito(carritoId: string): Promise<Carrito> {
  const { data } = await ms3Client.delete<Carrito>(`/api/carritos/${carritoId}/items`);
  return data;
}

export async function cambiarEstado(carritoId: string, estado: string): Promise<Carrito> {
  // estado: "ACTIVO" | "ABANDONADO" | "COMPLETADO"
  const { data } = await ms3Client.patch<Carrito>(`/api/carritos/${carritoId}/estado`, { estado });
  return data;
}

export async function cambiarMoneda(carritoId: string, moneda: string): Promise<Carrito> {
  const { data } = await ms3Client.patch<Carrito>(`/api/carritos/${carritoId}/moneda`, { moneda });
  return data;
}

export async function eliminarCarrito(carritoId: string): Promise<void> {
  await ms3Client.delete(`/api/carritos/${carritoId}`);
}

// Obtiene el carrito activo del cliente, creando uno nuevo si todavía no existe.
export async function obtenerOCrearCarrito(clienteId: string): Promise<Carrito> {
  try {
    return await obtenerCarritoActivoPorCliente(clienteId);
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return await crearCarrito({ idCliente: clienteId });
    }
    throw err;
  }
}
