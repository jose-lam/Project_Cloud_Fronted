import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAvailableStock, getProductById } from "../api/ms1";
import StarRating from "../components/StarRating";
import PriceTag from "../components/PriceTag";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { Product, StockInfo } from "../types";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [stock, setStock] = useState<StockInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { cliente } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return;
    setProduct(null);
    setError(null);
    setAdded(false);
    setQty(1);
    getProductById(productId)
      .then(setProduct)
      .catch(() => setError("No se pudo cargar este producto desde el MS1."));
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const clientId = cliente?.id ? Number(cliente.id) % 1000 || 1 : 1;
    getAvailableStock({ productId: product.product_id, clientId })
      .then(setStock)
      .catch(() => setStock(null));
  }, [product, cliente]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    setAdded(false);
    try {
      await addItem(product, qty);
      setAdded(true);
    } catch {
      setError("No se pudo agregar el producto al carrito (MS3).");
    } finally {
      setAdding(false);
    }
  }

  if (error && !product) {
    return (
      <div className="container">
        <div className="state-msg">
          <h3>Algo salió mal</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="product-detail">
          <div className="skeleton" style={{ aspectRatio: "1/1" }} />
          <div>
            <div className="skeleton" style={{ height: 28, width: "70%", marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 30 }} />
            <div className="skeleton" style={{ height: 100, width: "100%" }} />
          </div>
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  const outOfStock = stock !== null && stock.available_stock <= 0;

  return (
    <div className="container">
      <p className="breadcrumb">
        <Link to="/">Inicio</Link>
        {product.category && (
          <>
            {" › "}
            <Link to={`/categoria/${product.category.category_id}`}>{product.category.name}</Link>
          </>
        )}
        {" › "}
        {product.name}
      </p>

      <div className="product-detail">
        <div className="product-detail-media">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <span style={{ color: "var(--color-ink-faint)" }}>Sin imagen disponible</span>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-detail-meta">
            <StarRating value={Number(product.stars) || 0} reviews={product.reviews} size="md" />
            {product.category && <span className="badge badge-teal">{product.category.name}</span>}
          </div>

          <div className="product-detail-price-block">
            <PriceTag amount={product.price} size="lg" />
            {product.product_url && (
              <a href={product.product_url} target="_blank" rel="noreferrer" className="product-detail-original-link">
                Ir a Amazon de verdad ↗
              </a>
            )}
          </div>

          <p style={{ color: "var(--color-ink-soft)", fontSize: 14, lineHeight: 1.7 }}>
            Producto del catálogo MS1 (categoría {product.category?.name || "sin categoría"}). El precio y la
            disponibilidad se consultan en tiempo real desde el microservicio de inventario.
          </p>
        </div>

        <div className="buybox">
          {stock === null ? (
            <p className="buybox-stock" style={{ color: "var(--color-ink-faint)" }}>
              Consultando stock…
            </p>
          ) : outOfStock ? (
            <p className="buybox-stock" style={{ color: "var(--color-danger)" }}>
              Sin stock en tu país ({stock.client_country})
            </p>
          ) : (
            <p className="buybox-stock" style={{ color: "var(--color-teal)" }}>
              En stock — {stock.available_stock} disponibles en {stock.client_country}
            </p>
          )}

          <div className="buybox-qty">
            <label htmlFor="qty" style={{ fontSize: 13.5, fontWeight: 600 }}>
              Cantidad
            </label>
            <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={outOfStock}>
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleAddToCart} disabled={adding || outOfStock}>
            {adding ? "Agregando…" : outOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
          <button
            className="btn btn-dark btn-block"
            disabled={outOfStock}
            onClick={async () => {
              await handleAddToCart();
              navigate("/carrito");
            }}
          >
            Comprar ahora
          </button>

          {added && <p style={{ color: "var(--color-teal)", fontSize: 13, fontWeight: 600 }}>Agregado al carrito ✓</p>}
          {error && <p className="field-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
