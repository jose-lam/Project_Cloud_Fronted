import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import PriceTag from "./PriceTag";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/producto/${product.product_id}`} className="product-card">
      <div className="product-card-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-img-fallback">Sin imagen</div>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-name">{product.name}</p>
        <StarRating value={Number(product.stars) || 0} reviews={product.reviews} />
        <PriceTag amount={product.price} />
      </div>
    </Link>
  );
}
