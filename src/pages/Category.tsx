import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCategories, getProductsByCategory } from "../api/ms1";
import { getPopulatedCategories } from "../lib/populatedCategories";
import ProductCard from "../components/ProductCard";
import type { Category as CategoryType, PaginatedResult, Product } from "../types";

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [result, setResult] = useState<PaginatedResult<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CategoryType[]>([]);

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    getCategories()
      .then((cats) => setCategory(cats.find((c) => String(c.category_id) === categoryId) || null))
      .catch(() => {});
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    setResult(null);
    setError(null);
    getProductsByCategory(categoryId, { page, limit: 24 })
      .then(setResult)
      .catch(() => setError("No se pudo cargar esta categoría desde el MS1."));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryId, page]);

  useEffect(() => {
    if (!categoryId) return;
    getPopulatedCategories()
      .then((cats) => setSuggestions(cats.filter((c) => String(c.category_id) !== categoryId).slice(0, 6)))
      .catch(() => setSuggestions([]));
  }, [categoryId]);

  return (
    <div className="container">
      <div className="page-heading">
        <h1>{category?.name || "Categoría"}</h1>
        {result && <p>{result.total.toLocaleString("es-PE")} productos encontrados</p>}
      </div>

      <div className="page-body">
        {error && (
          <div className="state-msg">
            <h3>Algo salió mal</h3>
            <p>{error}</p>
          </div>
        )}

        {!error && !result && (
          <div className="product-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260 }} />
            ))}
          </div>
        )}

        {result?.data.length === 0 && (
          <div className="state-msg">
            <h3>No hay productos en esta categoría todavía</h3>
            <p>El MS1 todavía no tiene productos vinculados a esta categoría en su base de datos.</p>
            {suggestions.length > 0 && (
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
                {suggestions.map((c) => (
                  <Link key={c.category_id} to={`/categoria/${c.category_id}`} className="btn btn-outline btn-sm">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {result && result.data.length > 0 && (
          <div className="product-grid">
            {result.data.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}

        {result && result.total_pages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            <span>
              Página {result.page} de {result.total_pages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={page >= result.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}