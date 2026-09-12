import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import PriceTag, { formatPEN } from "../components/PriceTag";

const IGV = 0.18;

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
