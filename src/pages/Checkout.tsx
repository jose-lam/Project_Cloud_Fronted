import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPEN } from "../components/PriceTag";
import * as ms2 from "../api/ms2.mock";

const IGV = 0.18;
const METODOS = [
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "debito", label: "Tarjeta de débito" },
  { value: "paypal", label: "PayPal" },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { cliente } = useAuth();
  const [metodoPago, setMetodoPago] = useState("tarjeta_credito");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const impuestos = subtotal * IGV;
  const total = subtotal + impuestos;

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="state-msg">
          <h3>No tienes productos en el carrito</h3>
          <p>Agrega productos antes de continuar con el pago.</p>
        </div>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!cliente) return;
    setPlacing(true);
    setError(null);
    try {
      const { pedido } = await ms2.crearPedidoDesdeCarrito({
        clienteId: cliente.id,
        items: items.map((it) => ({
          idProducto: it.idProducto ?? it.id_producto ?? "",
          nombre: it.nombre,
          precioUnitario: it.precioUnitario,
          cantidad: it.cantidad,
        })),
        metodoPago,
      });
      await clearCart();
      navigate(`/pedido-confirmado/${pedido.id}`, { replace: true });
    } catch (err) {
      setError("No se pudo registrar el pedido. Intenta nuevamente.");
    } finally {
      setPlacing(false);
    }
  }

  if (!cliente) return null;

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Finalizar compra</h1>
        <p>Este paso simula al MS2 (Clientes / Pedidos / Pago) directamente — sin pasar por el orquestador.</p>
      </div>

      <div className="cart-layout page-body">
        <div>
          <div className="card" style={{ padding: 22, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Entregar a</h3>
            <p style={{ fontWeight: 600 }}>{cliente.nombre}</p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>
              {cliente.direccion || "Sin dirección registrada"}
            </p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>{cliente.email}</p>
          </div>

          <div className="card" style={{ padding: 22, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 14 }}>Método de pago</h3>
            {METODOS.map((m) => (
              <label
                key={m.value}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14 }}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value={m.value}
                  checked={metodoPago === m.value}
                  onChange={() => setMetodoPago(m.value)}
                />
                {m.label}
              </label>
            ))}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 12 }}>Productos ({items.length})</h3>
            {items.map((it) => (
              <div key={it.idProducto ?? it.id_producto} className="order-detail-row">
                <span>
                  {it.nombre} × {it.cantidad}
                </span>
                <span>S/ {formatPEN(it.precioUnitario * it.cantidad)}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="cart-summary">
          <h3 style={{ marginBottom: 12 }}>Resumen</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>S/ {formatPEN(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>IGV (18%)</span>
            <span>S/ {formatPEN(impuestos)}</span>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <span style={{ fontSize: 20, fontFamily: "var(--font-display)" }}>S/ {formatPEN(total)}</span>
          </div>
          {error && <p className="field-error" style={{ marginTop: 10 }}>{error}</p>}
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={handlePlaceOrder} disabled={placing}>
            {placing ? "Procesando pago…" : "Confirmar y pagar"}
          </button>
        </aside>
      </div>
    </div>
  );
}
