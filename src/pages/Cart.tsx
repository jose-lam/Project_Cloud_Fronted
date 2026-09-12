import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import PriceTag, { formatPEN } from "../components/PriceTag";
import { useRef, useState } from "react";
import { crearCarrito, mensajeErrorCarrito, obtenerCarritoActivo } from "../api/ms3";
import type { Carrito } from "../types";
import styles from "./Cart.module.css";

const IGV = 0.18;

// Consulta manual independiente del carrito de sesión y del checkout existentes.
export function CarritoConsulta() {
  const [idCliente, setIdCliente] = useState("CLI001");
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);

  async function solicitar(accion: "consultar" | "crear") {
    if (pending.current) return;
    const clienteId = idCliente.trim();
    setCarrito(null);
    setError(null);
    if (!clienteId) {
      setError("Ingresa el ID del cliente.");
      return;
    }
    pending.current = true;
    setLoading(true);
    try {
      setCarrito(await (accion === "crear" ? crearCarrito(clienteId) : obtenerCarritoActivo(clienteId)));
    } catch (err: unknown) {
      setError(mensajeErrorCarrito(err));
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  return (
    <section className={`container ${styles.consulta}`} aria-labelledby="carrito-titulo">
      <div className="page-heading">
        <h1 id="carrito-titulo">Carrito de compras</h1>
        <p>Consulta o crea el carrito activo de un cliente.</p>
      </div>
      <form className={`card ${styles.form}`} onSubmit={(event) => {
        event.preventDefault();
        void solicitar("consultar");
      }}>
        <div className="field">
          <label htmlFor="carrito-cliente">ID del cliente</label>
          <input id="carrito-cliente" name="idCliente" value={idCliente} disabled={loading}
            required placeholder="CLI001" onChange={(event) => {
              setIdCliente(event.target.value);
              setCarrito(null);
              setError(null);
            }} />
        </div>
        <div className={styles.actions}>
          <button className="btn btn-primary" type="submit" disabled={loading}>Consultar carrito</button>
          <button className="btn btn-outline" type="button" disabled={loading}
            onClick={() => void solicitar("crear")}>Crear carrito</button>
        </div>
      </form>

      {loading && <p role="status">Cargando carrito…</p>}
      {error && <div className={`state-msg ${styles.message}`} role="alert">{error}</div>}

      {carrito && !loading && (
        <div className="page-body" aria-live="polite">
          <h2>Carrito encontrado</h2>
          <p>ID del cliente: <strong>{carrito.idCliente}</strong></p>
          <p>Estado: <strong>{carrito.estado}</strong></p>
          <div className={`cart-layout ${styles.result}`}>
            <div className="cart-items">
              {carrito.items.length === 0 ? <p className="state-msg">El carrito está vacío.</p> : (
                <ul className={styles.items}>
                  {carrito.items.map((item) => (
                    <li className={`cart-item ${styles.item}`} key={item.idProducto ?? item.id_producto}>
                      {(item.urlImagen || item.url_imagen) && (
                        <img src={item.urlImagen || item.url_imagen} alt={item.nombre} loading="lazy" />
                      )}
                      <div>
                        <h3 className="cart-item-name">{item.nombre}</h3>
                        <p>Precio unitario: <PriceTag amount={item.precioUnitario} size="sm" /></p>
                        <p>Cantidad: {item.cantidad}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <aside className={`cart-summary ${styles.summary}`} aria-label="Resumen del carrito">
              <h3>Resumen del carrito</h3>
              <p>Total de artículos: <strong>{carrito.resumen.totalArticulos}</strong></p>
              <p>Subtotal: <strong>S/ {formatPEN(carrito.resumen.subtotal)}</strong></p>
              <p>Moneda: <strong>{carrito.resumen.moneda}</strong></p>
            </aside>
          </div>
        </div>
      )}
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}

export default function Cart() {
  const { items, subtotal, loading, error, updateQty, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const impuestos = subtotal * IGV;
  const total = subtotal + impuestos;

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate("/ingresar", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  }

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Tu carrito</h1>
        <p>Sincronizado en tiempo real con el microservicio de carrito (MS3).</p>
      </div>

      <div className="page-body">
        {error && (
          <div className="state-msg">
            <h3>No pudimos conectar con el carrito</h3>
            <p>{error}</p>
          </div>
        )}

        {!error && loading && (
          <div style={{ display: "flex", gap: 30 }}>
            <div className="skeleton" style={{ flex: 1, height: 200 }} />
            <div className="skeleton" style={{ width: 340, height: 200 }} />
          </div>
        )}

        {!error && !loading && items.length === 0 && (
          <div className="state-msg">
            <h3>Tu carrito está vacío</h3>
            <p>Explora el catálogo y agrega algún producto.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 18 }}>
              Ir al catálogo
            </Link>
          </div>
        )}

        {!error && !loading && items.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button className="btn-danger-ghost" onClick={clearCart}>
                  Vaciar carrito
                </button>
              </div>
              {items.map((item) => {
                const productoId = item.idProducto ?? item.id_producto ?? "";
                return (
                  <div className="cart-item" key={productoId}>
                    <div className="cart-item-img">
                      {item.urlImagen ? (
                        <img src={item.urlImagen} alt={item.nombre} />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-ink-faint)",
                            fontSize: 11,
                          }}
                        >
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="cart-item-name">{item.nombre}</p>
                      <PriceTag amount={item.precioUnitario} size="sm" />
                      <div className="cart-item-controls">
                        <div className="qty-stepper">
                          <button onClick={() => updateQty(productoId, item.cantidad - 1)} aria-label="Reducir cantidad">
                            −
                          </button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => updateQty(productoId, item.cantidad + 1)} aria-label="Aumentar cantidad">
                            +
                          </button>
                        </div>
                        <button className="btn-danger-ghost" onClick={() => removeItem(productoId)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 700 }}>
                      S/ {formatPEN(item.precioUnitario * item.cantidad)}
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="cart-summary">
              <h3 style={{ marginBottom: 12 }}>Resumen del pedido</h3>
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
              <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={handleCheckout}>
                Proceder al pago
              </button>
              {!isAuthenticated && (
                <p style={{ fontSize: 12, color: "var(--color-ink-faint)", marginTop: 10, textAlign: "center" }}>
                  Necesitas iniciar sesión para completar la compra.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
