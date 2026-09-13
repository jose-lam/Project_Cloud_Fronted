import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getProducts } from "../api/ms1";
import { getPopulatedCategories } from "../lib/populatedCategories";
import CategoryRow from "../components/CategoryRow";
import ProductCard from "../components/ProductCard";
import type { Category, Product } from "../types";

export default function Home() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [featuredError, setFeaturedError] = useState(false);

  const [popCategories, setPopCategories] = useState<Category[] | null>(null);
  const [popError, setPopError] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[] | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    getProducts({ page: 1, limit: 12 })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeaturedError(true));

    getPopulatedCategories()
      .then((cats) => setPopCategories(cats.slice(0, 6)))
      .catch(() => setPopError(true));
  }, []);

  function loadAllCategories() {
    setShowAllCategories(true);
    if (!allCategories) {
      getCategories()
        .then(setAllCategories)
        .catch(() => setAllCategories([]));
    }
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <p className="hero-eyebrow">Marketplace multicategoría</p>
            <h1>Todo lo que buscas, cruzando la nube en segundos.</h1>
            <p>
              Catálogo, carrito y analítica corriendo sobre microservicios independientes conectados por
              AWS API Gateway: así de rápido se mueve Qhapaq.
            </p>
            <div className="hero-cta">
              <a href="#destacados" className="btn btn-primary">
                Ver productos destacados
              </a>
              <Link to="/analitica" className="btn btn-outline" style={{ color: "#fff", borderColor: "#5c67a8" }}>
                Ver panel analítico
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div style={{ background: "#3d3270" }} />
            <div style={{ background: "#e3a33b" }} />
            <div style={{ background: "#1f6f6b" }} />
            <div style={{ background: "#4a3e82" }} />
          </div>
        </div>
      </section>

      <div className="container" id="destacados">
        {/* ---------- Productos destacados (catálogo general del MS1) ---------- */}
        <section className="category-row">
          <div className="category-row-head">
            <h2>Productos destacados</h2>
          </div>

          {featuredError && (
            <div className="state-msg">
              <h3>No pudimos cargar el catálogo</h3>
              <p>Verifica que el MS1 esté activo y que VITE_MS1_URL apunte a la URL correcta.</p>
            </div>
          )}

          {!featuredError && !featured && (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 260 }} />
              ))}
            </div>
          )}

          {featured?.length === 0 && (
            <div className="state-msg">
              <h3>Todavía no hay productos cargados</h3>
              <p>Carga productos desde el MS1 para que aparezcan aquí.</p>
            </div>
          )}

          {featured && featured.length > 0 && (
            <div className="product-grid">
              {featured.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ---------- Categorías con inventario real ---------- */}
        {!popError &&
          popCategories?.map((cat) => <CategoryRow key={cat.category_id} category={cat} />)}

        {popError && (
          <div className="state-msg">
            <p>No se pudieron detectar categorías con stock desde el MS1.</p>
          </div>
        )}

        {/* ---------- Explorar el resto del catálogo de categorías ---------- */}
        <section style={{ padding: "30px 0 60px" }}>
          {!showAllCategories ? (
            <button className="btn-ghost" onClick={loadAllCategories}>
              Explorar todas las categorías del catálogo →
            </button>
          ) : (
            <>
              <h2 style={{ fontSize: 18, marginBottom: 14 }}>Todas las categorías</h2>
              <p style={{ color: "var(--color-ink-faint)", fontSize: 13, marginBottom: 16 }}>
                El MS1 tiene {allCategories?.length ?? "…"} categorías registradas; sólo un subconjunto tiene
                productos vinculados todavía, así que algunas pueden mostrarse vacías.
              </p>
              {!allCategories ? (
                <div className="skeleton" style={{ height: 120 }} />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 8,
                  }}
                >
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.category_id}
                      to={`/categoria/${cat.category_id}`}
                      style={{ fontSize: 13.5, color: "var(--color-primary)", padding: "4px 0" }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}