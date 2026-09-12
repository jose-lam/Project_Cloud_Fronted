import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/ms1";
import CategoryRow from "../components/CategoryRow";
import type { Category } from "../types";

export default function Home() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError(true));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <p className="hero-eyebrow">Marketplace multicategoría</p>
            <h1>Todo lo que buscas, cruzando la nube en segundos.</h1>
            <p>
              Catálogo, carrito y analítica corriendo sobre cinco microservicios independientes:
              así de rápido se mueve Qhapaq.
            </p>
            <div className="hero-cta">
              <Link to="/categoria/1" className="btn btn-primary">
                Explorar catálogo
              </Link>
              <Link to="/analitica" className="btn btn-outline" style={{ color: "#fff", borderColor: "#5c4f95" }}>
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

      <div className="container">
        {error && (
          <div className="state-msg">
            <h3>No pudimos cargar el catálogo</h3>
            <p>Verifica que el MS1 esté activo y que VITE_MS1_URL apunte a la URL correcta.</p>
          </div>
        )}
        {!error && !categories && (
          <div style={{ padding: "50px 0" }}>
            <div className="skeleton" style={{ height: 22, width: 180, marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 16 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 200, height: 260 }} />
              ))}
            </div>
          </div>
        )}
        {categories?.length === 0 && (
          <div className="state-msg">
            <h3>Todavía no hay categorías</h3>
            <p>Carga categorías desde el MS1 para que aparezcan aquí.</p>
          </div>
        )}
        {categories?.map((cat) => (
          <CategoryRow key={cat.category_id} category={cat} />
        ))}
      </div>
    </>
  );
}
