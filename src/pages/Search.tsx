import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProductsByName } from "../api/ms1";
import ProductCard from "../components/ProductCard";
import type { PaginatedResult, Product } from "../types";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [result, setResult] = useState<PaginatedResult<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [query]);

  useEffect(() => {
    if (!query) return;
    setResult(null);
    setError(null);
    searchProductsByName(query, { page, limit: 24 })
      .then(setResult)
      .catch(() => setError("No se pudo completar la búsqueda en el MS1."));
  }, [query, page]);

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Resultados para "{query}"</h1>
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
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260 }} />
            ))}
          </div>
        )}
        {result?.data.length === 0 && (
          <div className="state-msg">
            <h3>No encontramos productos con ese nombre</h3>
            <p>Prueba con otro término de búsqueda.</p>
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
