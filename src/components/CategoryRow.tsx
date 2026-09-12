import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductsByCategory } from "../api/ms1";
import ProductCard from "./ProductCard";
import type { Category, Product } from "../types";

interface CategoryRowProps {
  category: Category;
  limit?: number;
}

export default function CategoryRow({ category, limit = 8 }: CategoryRowProps) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getProductsByCategory(category.category_id, { limit })
      .then((res) => alive && setProducts(res.data))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [category.category_id, limit]);

  if (error) return null;

  return (
    <section className="category-row">
      <div className="category-row-head">
        <h2>{category.name}</h2>
        <Link to={`/categoria/${category.category_id}`} className="btn-ghost">
          Ver todo →
        </Link>
      </div>
      <div className="category-row-track">
        {!products &&
          Array.from({ length: 4 }).map((_, i) => (
            <div className="product-card skeleton-card" key={i}>
              <div className="skeleton" style={{ aspectRatio: "1/1" }} />
              <div className="skeleton" style={{ height: 14, marginTop: 10, width: "80%" }} />
              <div className="skeleton" style={{ height: 14, marginTop: 8, width: "40%" }} />
            </div>
          ))}
        {products?.length === 0 && (
          <p style={{ color: "var(--color-ink-faint)", padding: "20px 0" }}>
            Todavía no hay productos en esta categoría.
          </p>
        )}
        {products?.map((p) => (
          <ProductCard key={p.product_id} product={p} />
        ))}
      </div>
    </section>
  );
}
