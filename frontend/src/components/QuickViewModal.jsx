import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, CheckCircle, Star } from 'lucide-react';

/**
 * [FRONTEND REACT BUG #2 - FIXED]:
 * - `imageSrc` is now synchronized with the `product` prop via useEffect,
 *   so opening a different product always shows that product's image.
 */
export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  // FIX: Keep local image state in sync when the selected product changes
  const [imageSrc, setImageSrc] = useState(product?.image);

  useEffect(() => {
    setImageSrc(product?.image);
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-body">
          <div className="modal-image-col">
            {/* FIX: imageSrc stays in sync with the selected product */}
            <img src={imageSrc} alt={product.title} />
          </div>

          <div className="modal-info-col">
            <span className="product-badge">{product.category}</span>
            <h2>{product.title}</h2>

            <div className="rating-row">
              <span style={{ color: 'var(--warning)' }}>★</span> {product.rating}{' '}
              <span>({product.reviewsCount} verified reviews)</span>
            </div>

            <p className="modal-product-price">${product.price.toFixed(2)}</p>
            <p className="modal-product-desc">{product.description}</p>

            <div className="stock-info">
              <CheckCircle size={16} /> In Stock ({product.stock} available)
            </div>

            <div className="modal-actions">
              <div className="qty-selector">
                <button onClick={handleDecrease}>-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={handleIncrease}>+</button>
              </div>

              <button onClick={handleAddToCart} className="btn btn-primary">
                <ShoppingBag size={18} /> Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
