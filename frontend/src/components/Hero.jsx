import React from 'react';
import { Sparkles, ShoppingCart, Tag } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <span className="hero-tag">
          <Sparkles size={14} /> 2026 Collection
        </span>
        <h1 className="hero-title">Next-Gen Essentials For Modern Living</h1>
        <p className="hero-subtitle">
          Curated premium audio, intelligent wearables, and minimalist gear crafted for peak performance.
        </p>
        <div className="hero-cta-group">
          <button onClick={onExploreClick} className="btn btn-primary">
            <ShoppingCart size={18} /> Explore Catalog
          </button>
          <a href="#catalog-section" className="btn btn-secondary">
            <Tag size={18} /> View Active Deals
          </a>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-card">
          <h3>4.9★</h3>
          <p>User Satisfaction</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>Premium Support</p>
        </div>
        <div className="stat-card">
          <h3>100%</h3>
          <p>Authentic Gear</p>
        </div>
      </div>
    </section>
  );
}
