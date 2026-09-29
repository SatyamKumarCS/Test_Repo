import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import ToastContainer from './components/Toast';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  
  // Filtering & Sorting State
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState('0.00');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Discounts & Promo
  const [activeDiscount, setActiveDiscount] = useState(0);
  const [activeCouponCode, setActiveCouponCode] = useState('');

  /**
   * [FRONTEND REACT BUG #5]:
   * - Cart initialization tries to parse raw localStorage string
   * - Cart persistence effect calls localStorage.setItem('novashop_cart', cart) without JSON.stringify
   * - Results in "[object Object]" saved to localStorage
   */
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('novashop_cart');
      if (saved && saved !== '[object Object]') {
        return JSON.parse(saved);
      }
      return [];
    } catch (e) {
      console.warn('Failed to parse cart from storage:', e);
      return [];
    }
  });

  // BUG: Missing JSON.stringify(cart)
  useEffect(() => {
    try {
      localStorage.setItem('novashop_cart', cart);
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [cart]);

  // Toast Trigger Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch Products from Backend API
  const fetchProducts = async (cat = activeCategory, search = searchQuery, sort = sortBy) => {
    setLoading(true);
    try {
      let url = `/api/products?category=${encodeURIComponent(cat)}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (sort) {
        url += `&sortBy=${encodeURIComponent(sort)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        showToast('Failed to load products', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Could not connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, sortBy]);

  // Theme Toggler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  /**
   * [FRONTEND REACT BUG #4]:
   * - Search input does not fetch or reset catalog when input is cleared with Backspace
   *   because it only calls fetchProducts if length > 0.
   */
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      fetchProducts(activeCategory, query.trim(), sortBy);
    }
    // BUG: Missing else branch to trigger fetchProducts(activeCategory, '', sortBy) when empty!
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchProducts(activeCategory, '', sortBy);
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSortBy('featured');
    fetchProducts('All', '', 'featured');
  };

  // Cart Management
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: Number(quantity) })
      });
      const data = await res.json();

      if (data.success) {
        setCart((prevCart) => {
          const existing = prevCart.find((item) => item.id === product.id);
          if (existing) {
            return prevCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + Number(quantity) }
                : item
            );
          }
          return [
            ...prevCart,
            {
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image,
              quantity: Number(quantity)
            }
          ];
        });
        showToast(`Added "${product.title}" to cart`, 'success');
      }
    } catch (err) {
      console.error('Cart add error:', err);
      showToast('Failed to add item to cart', 'error');
    }
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    showToast('Item removed from cart');
  };

  // Coupon Code Application
  const handleApplyCoupon = async (code, subtotal) => {
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();

      if (data.success) {
        setActiveDiscount(data.discount);
        setActiveCouponCode(data.code);
        return { success: true, code: data.code, discount: data.discount };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Server communication error' };
    }
  };

  // Checkout Processing
  const handleProceedCheckout = (computedTotal) => {
    setCheckoutTotal(computedTotal);
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = async (formData) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            zipCode: formData.zipCode
          },
          paymentMethod: formData.paymentMethod,
          total: checkoutTotal
        })
      });

      const data = await res.json();
      if (data.success) {
        setCart([]);
        setActiveDiscount(0);
        setActiveCouponCode('');
        setIsCheckoutOpen(false);
        setConfirmedOrder(data.order);
      } else {
        showToast(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      showToast('Order placement failed', 'error');
    }
  };

  const totalCartItemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <div className="app-container">
      <Navbar
        cartCount={totalCartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      <Hero onExploreClick={() => {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />

      <ProductGrid
        products={products}
        loading={loading}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        sortBy={sortBy}
        onSortChange={(sort) => setSortBy(sort)}
        onQuickView={(prod) => setSelectedProduct(prod)}
        onAddToCart={(prod) => handleAddToCart(prod, 1)}
        onResetFilters={handleResetFilters}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={handleProceedCheckout}
        activeDiscount={activeDiscount}
        activeCouponCode={activeCouponCode}
        onApplyCoupon={handleApplyCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={checkoutTotal}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <div className="brand">
              <span>Nova<strong>Shop</strong></span>
            </div>
            <p>Premium React & Express e-commerce architecture designed for debugging & assessment.</p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="#catalog-section">All Products</a></li>
              <li><a href="#catalog-section">Trending Audio</a></li>
              <li><a href="#catalog-section">Smart Wearables</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Developer Challenge</h4>
            <p>This codebase contains intentional React & Node.js bugs documented in issues.md.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 NovaShop Inc. React Edition.</p>
        </div>
      </footer>
    </div>
  );
}
