import React, { useState } from 'react';
import { X, Lock, Check, CreditCard } from 'lucide-react';

/**
 * [FRONTEND REACT BUG #3 - FIXED]:
 * - Email regex now accepts standard addresses (dots, subdomains, plus tags).
 * - Replaced the accidental assignment `if (isEmailValid = false)` with a proper
 *   negation check `if (!isEmailValid)`, so valid emails no longer disable checkout.
 */
export default function CheckoutModal({ isOpen, onClose, totalAmount, onSubmitOrder }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    zipCode: '',
    paymentMethod: 'Credit Card'
  });

  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    // FIX: Permissive RFC-style pattern accepting dots, subdomains, and plus tags
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);

    // FIX: Proper negation instead of the assignment bug `isEmailValid = false`
    if (!isEmailValid) {
      setEmailError(true);
      return false;
    } else {
      setEmailError(false);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.street || !formData.city || !formData.zipCode) {
      alert('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    await onSubmitOrder(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout modal">
          <X size={18} />
        </button>

        <h2>
          <Lock size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-primary)' }} />
          Secure Checkout
        </h2>
        <p className="subtitle">Complete your shipping and payment information.</p>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h3>1. Contact Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Alex Johnson"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="alex.johnson@example.com"
                />
                {emailError && (
                  <small className="error-text">Please enter a valid email address</small>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>2. Shipping Address</h3>
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
                placeholder="123 Innovation Way"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="San Francisco"
                />
              </div>
              <div className="form-group">
                <label>Zip / Postal Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  placeholder="94107"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>3. Payment Method</h3>
            <div className="payment-options">
              {['Credit Card', 'PayPal', 'Apple Pay'].map((method) => (
                <label key={method} className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={handleInputChange}
                  />
                  <span>
                    <CreditCard size={14} style={{ marginRight: 6 }} />
                    {method}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="checkout-order-summary">
            <div className="summary-line">
              <span>Payable Amount:</span>
              <strong>${totalAmount}</strong>
            </div>
          </div>

          {/* FIX: button is only disabled while submitting or on a genuine email error */}
          <button
            type="submit"
            disabled={isSubmitting || emailError}
            className="btn btn-primary btn-block"
          >
            {isSubmitting ? (
              'Processing Order...'
            ) : (
              <>
                Complete Purchase <Check size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
