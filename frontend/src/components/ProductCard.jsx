import React from 'react';
import { Star, Eye, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onQuickView, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="card-image-wrap">
        <span className="card-category-badge">{product.category}</span>
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>

      <div className="card-body">
        <div className="card-rating">
          <Star size={14} fill="currentColor" />
          <strong>{product.rating}</strong>
          <span>({product.reviewsCount})</span>
        </div>

        <h3 className="card-title">{product.title}</h3>

        <div className="card-footer">
          <div className="card-price">${product.price.toFixed(2)}</div>
          <div className="card-actions">
            <button
              className="btn-card-icon"
              onClick={() => onQuickView(product)}
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye size={18} />
            </button>
            <button
              className="btn-card-icon"
              onClick={() => onAddToCart(product)}
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
