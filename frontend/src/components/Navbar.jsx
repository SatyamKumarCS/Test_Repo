import React from 'react';
import { ShoppingBag, Moon, Sun, Search, X, Zap } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onClearSearch
}) {
  return (
    <>
      {/* Top Promotional Bar */}
      <div className="top-banner">
        <p>
          ⚡ Spring Flash Sale: Use code <strong>SAVE20</strong> for 20% off orders over $100! <span>Free Global Delivery</span>
        </p>
      </div>

      {/* Main Sticky Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Zap className="brand-icon" size={24} />
            <span>Nova<strong>Shop</strong></span>
          </div>

          <div className="search-bar-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              id="search-input"
              placeholder="Search gadgets, audio, lifestyle..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="clear-btn"
                onClick={onClearSearch}
                title="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="nav-actions">
            <button
              className="icon-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              className="cart-btn"
              onClick={onOpenCart}
              aria-label="View Shopping Cart"
            >
              <ShoppingBag size={18} />
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
