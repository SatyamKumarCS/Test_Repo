import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrap">
          <CheckCircle2 size={56} />
        </div>
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. We've received your order and are getting it ready for shipment.</p>

        <div className="order-receipt-box">
          <div className="receipt-row">
            <span>Order ID:</span>
            <strong>#{order.orderId}</strong>
          </div>
          <div className="receipt-row">
            <span>Amount Paid:</span>
            <strong>${Number(order.total).toFixed(2)}</strong>
          </div>
          <div className="receipt-row">
            <span>Status:</span>
            <span className="status-badge">Processing</span>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-primary btn-block">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
