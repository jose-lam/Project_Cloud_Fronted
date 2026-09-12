import { isAxiosError } from "axios";
import { ms3Client } from "./client";
import type { CartItem, Carrito, NuevoCarritoPayload } from "../types";

// MS3 — Carrito de Compras (NoSQL / MongoDB)
// Repositorio: https://github.com/jose-lam/Cloud_backend_ms3

// Conserva el payload existente para los consumidores del contexto de carrito.
export async function crearCarrito(payload: string | NuevoCarritoPayload): Promise<Carrito> {
  const body = typeof payload === "string" ? { idCliente: payload } : payload;
  const { data } = await ms3Client.post<Carrito>("", body);
  return data;
}

export async function obtenerCarrito(id: string): Promise<Carrito> {
  const { data } = await ms3Client.get<Carrito>(`/${encodeURIComponent(id)}`);
  return data;
}

export async function obtenerCarritoActivoPorCliente(clienteId: string): Promise<Carrito> {
  const { data } = await ms3Client.get<Carrito>(`/cliente/${encodeURIComponent(clienteId)}`);
  return data;
}

export async function agregarItem(carritoId: string, item: CartItem): Promise<Carrito> {
  // item: { idProducto, nombre, precioUnitario, urlImagen, urlProducto, cantidad }
  const { data } = await ms3Client.post<Carrito>(`/${encodeURIComponent(carritoId)}/items`, item);
  return data;
}

export async function actualizarCantidad(
  carritoId: string,
  productoId: string | number,
  cantidad: number
): Promise<Carrito> {
  const { data } = await ms3Client.patch<Carrito>(`/${encodeURIComponent(carritoId)}/items/${encodeURIComponent(productoId)}`, {
    cantidad,
  });
  return data;
}

export async function eliminarItem(carritoId: string, productoId: string | number): Promise<Carrito> {
  const { data } = await ms3Client.delete<Carrito>(`/${encodeURIComponent(carritoId)}/items/${encodeURIComponent(productoId)}`);
  return data;
}

export async function vaciarCarrito(carritoId: string): Promise<Carrito> {
  const { data } = await ms3Client.delete<Carrito>(`/${encodeURIComponent(carritoId)}/items`);
  return data;
}

export async function cambiarEstado(carritoId: string, estado: string): Promise<Carrito> {
  // estado: "ACTIVO" | "ABANDONADO" | "COMPLETADO"
  const { data } = await ms3Client.patch<Carrito>(`/${encodeURIComponent(carritoId)}/estado`, { estado });
  return data;
}

export async function cambiarMoneda(carritoId: string, moneda: string): Promise<Carrito> {
  const { data } = await ms3Client.patch<Carrito>(`/${encodeURIComponent(carritoId)}/moneda`, { moneda });
  return data;
}

export async function eliminarCarrito(carritoId: string): Promise<void> {
  await ms3Client.delete(`/${encodeURIComponent(carritoId)}`);
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

export const obtenerCarritoActivo = obtenerCarritoActivoPorCliente;

/** Traduce errores HTTP, respuestas no JSON y fallos de red a mensajes de UI. */
export function mensajeErrorCarrito(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servicio de carrito. Revisa tu conexión e intenta nuevamente.";
    }
    const { status, data } = error.response;
    if (status === 404) return "No se encontró un carrito activo para este cliente.";
    if (status >= 500) return "El servicio de carrito no está disponible en este momento. Intenta nuevamente más tarde.";
    if (data && typeof data === "object" && "mensaje" in data && typeof data.mensaje === "string" && data.mensaje.trim()) {
      return data.mensaje;
    }
    if (status === 400) return "No se pudo procesar la solicitud. Verifica el ID del cliente.";
    return "No se pudo completar la solicitud del carrito. Intenta nuevamente.";
  }
  return error instanceof Error ? error.message : "Ocurrió un error al consultar el carrito.";
}
