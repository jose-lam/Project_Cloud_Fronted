import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as ms3 from "../api/ms3";
import { useAuth } from "./AuthContext";
import type { CartItem, Carrito, Product } from "../types";

const CartContext = createContext<CartContextValue | null>(null);
const GUEST_ID_KEY = "ms3_guest_cliente_id";

interface CartContextValue {
  carrito: Carrito | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  addItem: (product: Product, cantidad?: number) => Promise<Carrito | undefined>;
  updateQty: (idProducto: string | number, cantidad: number) => Promise<void>;
  removeItem: (idProducto: string | number) => Promise<void>;
  clearCart: () => Promise<void>;
  reload: () => void;
  activeClienteId: string;
}

function getOrCreateGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `invitado-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { cliente } = useAuth();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeClienteId = cliente ? String(cliente.id) : getOrCreateGuestId();

  const loadCart = useCallback(async (clienteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ms3.obtenerOCrearCarrito(clienteId);
      setCarrito(data);
    } catch (err) {
      setError("No se pudo conectar con el microservicio de carrito (MS3).");
      setCarrito(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Al iniciar sesión, si había un carrito de invitado con productos, lo
  // migramos al carrito del cliente autenticado.
  useEffect(() => {
    async function init() {
      if (!cliente) {
        await loadCart(getOrCreateGuestId());
        return;
      }
      const guestId = localStorage.getItem(GUEST_ID_KEY);
      setLoading(true);
      try {
        let guestCart: Carrito | null = null;
        if (guestId && guestId !== String(cliente.id)) {
          try {
            guestCart = await ms3.obtenerCarritoActivoPorCliente(guestId);
          } catch {
            guestCart = null;
          }
        }
        const userCart = await ms3.obtenerOCrearCarrito(String(cliente.id));
        if (guestCart?.items?.length) {
          let merged = userCart;
          for (const item of guestCart.items) {
            merged = await ms3.agregarItem(merged.id, {
              idProducto: item.idProducto ?? item.id_producto,
              nombre: item.nombre,
              precioUnitario: item.precioUnitario ?? item.precio_unitario ?? 0,
              urlImagen: item.urlImagen ?? item.url_imagen,
              urlProducto: item.urlProducto ?? item.url_producto,
              cantidad: item.cantidad,
            });
          }
          await ms3.eliminarCarrito(guestCart.id).catch(() => {});
          setCarrito(merged);
        } else {
          setCarrito(userCart);
        }
      } catch (err) {
        setError("No se pudo conectar con el microservicio de carrito (MS3).");
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente?.id]);

  async function addItem(product: Product, cantidad = 1): Promise<Carrito | undefined> {
    if (!carrito) return;
    const payload: CartItem = {
      idProducto: product.product_id,
      nombre: product.name,
      precioUnitario: Number(product.price),
      urlImagen: product.image_url || undefined,
      urlProducto: product.product_url || undefined,
      cantidad,
    };
    const updated = await ms3.agregarItem(carrito.id, payload);
    setCarrito(updated);
    return updated;
  }

  async function updateQty(idProducto: string | number, cantidad: number): Promise<void> {
    if (!carrito) return;
    if (cantidad <= 0) return removeItem(idProducto);
    const updated = await ms3.actualizarCantidad(carrito.id, idProducto, cantidad);
    setCarrito(updated);
  }

  async function removeItem(idProducto: string | number): Promise<void> {
    if (!carrito) return;
    const updated = await ms3.eliminarItem(carrito.id, idProducto);
    setCarrito(updated);
  }

  async function clearCart(): Promise<void> {
    if (!carrito) return;
    const updated = await ms3.vaciarCarrito(carrito.id);
    setCarrito(updated);
  }

  const itemCount = useMemo(
    () => (carrito?.items || []).reduce((sum, it) => sum + it.cantidad, 0),
    [carrito]
  );

  const subtotal = useMemo(
    () => (carrito?.items || []).reduce((sum, it) => sum + it.precioUnitario * it.cantidad, 0),
    [carrito]
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        items: carrito?.items || [],
        itemCount,
        subtotal,
        loading,
        error,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        reload: () => loadCart(activeClienteId),
        activeClienteId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
