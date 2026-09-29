import React from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, PackageOpen, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Accessories', 'Lifestyle'];

export default function ProductGrid({
  products,
  loading,
  activeCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onQuickView,
  onAddToCart,
  onResetFilters
}) {
  return (
    <main className="catalog-section" id="catalog-section">
      <div className="catalog-container">
        
        {/* Filter Toolbar */}
        <div className="filter-toolbar">
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat === 'All' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          <div className="sort-wrapper">
            <SlidersHorizontal size={16} />
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid State */}
        {loading ? (
          <div className="loading-spinner">
            <Loader2 size={36} className="fa-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12 }}>Loading catalog items...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="no-products-message">
            <PackageOpen size={48} />
            <h3 style={{ marginTop: 12 }}>No matching products found</h3>
            <p>Try searching for a different keyword or resetting filters.</p>
            <button onClick={onResetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
