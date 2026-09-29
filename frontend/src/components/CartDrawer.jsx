import React, { useState } from 'react';
import { ShoppingBag, X, Trash2, ArrowRight } from 'lucide-react';

/**
 * [FRONTEND REACT BUG #1 - FIXED]:
 * - `tax` is now kept as a Number for arithmetic and only formatted for display.
 * - Grand Total is a numeric sum: `(subtotal - discount + taxAmount).toFixed(2)`.
 */
export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  activeDiscount,
  activeCouponCode,
  onApplyCoupon
}) {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // FIX: Keep tax as a Number for arithmetic; format only for display
  const taxAmount = subtotal * 0.08;
  const tax = taxAmount.toFixed(2);

  // FIX: Numeric sum, then format the final total
  const grandTotal = (subtotal - activeDiscount + taxAmount).toFixed(2);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const result = await onApplyCoupon(couponCodeInput.trim(), subtotal);
    if (result.success) {
      setCouponStatus({ type: 'success', message: `Promo code "${result.code}" applied: $${result.discount} off!` });
    } else {
      setCouponStatus({ type: 'error', message: result.message || 'Invalid coupon code' });
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="cart-drawer open">
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={20} />
            <h2>Your Cart</h2>
          </div>
          <button className="close-drawer-btn" onClick={onClose} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>Your shopping cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} className="cart-item-img" alt={item.title} />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.title}</h4>
                  <div className="cart-item-price">${item.price.toFixed(2)}</div>
                  <div className="cart-item-controls">
                    <div className="cart-qty-ctrl">
                      <button onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button
                      className="cart-item-remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <form onSubmit={handleCouponSubmit} className="coupon-box">
              <input
                type="text"
                placeholder="Promo code (e.g. SAVE20)"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-sm">
                Apply
              </button>
            </form>

            {couponStatus && (
              <div className={`coupon-alert ${couponStatus.type}`}>
                {couponStatus.message}
              </div>
            )}

            <div className="cart-summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {activeDiscount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount ({activeCouponCode})</span>
                  <span>-${activeDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated Tax (8%)</span>
                <span>${tax}</span>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                {/* BUG: Displays concatenated grand total */}
                <span>${grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedCheckout(grandTotal);
              }}
              className="btn btn-primary btn-block"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
