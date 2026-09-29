# 🐛 NovaShop — Issue & Bug Tracker (React & Node.js Edition)

This document catalogs all **10 intentional bugs (5 Frontend React + 5 Backend Express)** embedded into the NovaShop codebase. Use this guide to assess debugging ability, run code interviews, or verify fixes.

---

## 🎨 Part 1: Frontend React Issues

### 🔴 Frontend React Issue #1: Grand Total String Concatenation & Tax Calculation Bug
- **File**: [frontend/src/components/CartDrawer.jsx](file:///Users/satyamkumar/Desktop/test_repo/frontend/src/components/CartDrawer.jsx)
- **Severity**: High (Financial Calculation Error)
- **Symptom**: The grand total in the cart drawer displays an incorrect concatenated number (e.g., `808.00` instead of `88.00` or invalid string math) after applying discounts and taxes.
- **Steps to Reproduce**:
  1. Add any product to the cart (e.g. $100 item).
  2. Open the cart drawer and observe the Total price.
  3. Notice the total is computed as `subtotal - activeDiscount + tax`, where `tax` was formatted via `.toFixed(2)` which returns a `string`, causing string concatenation instead of numeric addition.
- **Expected Behavior**: Total must be a numeric sum: `(subtotal - activeDiscount + Number(tax)).toFixed(2)`.
- **Fix / Hint**:
  ```javascript
  // In frontend/src/components/CartDrawer.jsx
  // Change:
  const tax = (subtotal * 0.08).toFixed(2);
  const grandTotal = subtotal - activeDiscount + tax;
  
  // To:
  const taxAmount = subtotal * 0.08;
  const grandTotal = (subtotal - activeDiscount + taxAmount).toFixed(2);
  ```

---

### 🔴 Frontend React Issue #2: Quick View Modal Stale Image on Product Change
- **File**: [frontend/src/components/QuickViewModal.jsx](file:///Users/satyamkumar/Desktop/test_repo/frontend/src/components/QuickViewModal.jsx)
- **Severity**: Medium (Visual/State Desync Bug)
- **Symptom**: Clicking "Quick View" on different products updates the title, category, and price, but the product preview image stays stuck on the first product that was opened.
- **Steps to Reproduce**:
  1. Click the eye icon (Quick View) on product #1 ("Aura Pro Wireless ANC Headphones").
  2. Close the modal.
  3. Click the eye icon on product #2 ("Pulse Smartwatch Ultra Series").
  4. Notice the image preview still shows the headphones image from product #1 because state `imageSrc` was initialized once without updating when `product.image` prop changes.
- **Expected Behavior**: Modal product preview should always display the currently selected product's image (`product.image`).
- **Fix / Hint**:
  ```javascript
  // In frontend/src/components/QuickViewModal.jsx
  // Change:
  <img src={imageSrc} alt={product.title} />
  
  // To:
  <img src={product.image} alt={product.title} />
  // (Or add useEffect(() => setImageSrc(product.image), [product?.id]))
  ```

---

### 🔴 Frontend React Issue #3: Checkout Email Validation Regex & Assignment Operator Bug
- **File**: [frontend/src/components/CheckoutModal.jsx](file:///Users/satyamkumar/Desktop/test_repo/frontend/src/components/CheckoutModal.jsx) (`validateEmail`)
- **Severity**: High (Conversion Blocker)
- **Symptom**: The user cannot submit the checkout form. Valid emails with dots, subdomains, or special characters (like `alex.johnson@work.com`) are flagged as invalid, and the submit button remains permanently disabled.
- **Steps to Reproduce**:
  1. Add an item to cart and click "Proceed to Checkout".
  2. Enter `alex.johnson@example.com` in the email input.
  3. Observe that an assignment error `if (isEmailValid = false)` forces the flag to `false` and disables the submit button.
- **Expected Behavior**: Standard RFC-compliant emails should be accepted and the order button should remain active.
- **Fix / Hint**:
  ```javascript
  // In frontend/src/components/CheckoutModal.jsx
  // Change:
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}$/;
  let isEmailValid = emailRegex.test(email);
  if (isEmailValid = false) { ... }
  
  // To:
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  if (!isEmailValid) {
    setEmailError(true);
    return false;
  } else {
    setEmailError(false);
    return true;
  }
  ```

---

### 🔴 Frontend React Issue #4: Search Input Filter Does Not Reset on Empty Query
- **File**: [frontend/src/App.jsx](file:///Users/satyamkumar/Desktop/test_repo/frontend/src/App.jsx) (`handleSearchChange`)
- **Severity**: Medium (UX / Navigation Bug)
- **Symptom**: When a user types into the search box and then deletes all text with backspace, the product catalog does not revert to showing all items; it remains stuck on the last filtered results.
- **Steps to Reproduce**:
  1. Type `Mouse` into the search bar. The grid filters to the mouse product.
  2. Highlight the search text and press Backspace to clear it.
  3. The catalog does not reload the full list because `handleSearchChange` checks `if (query.trim().length > 0)` without an `else` branch to fetch the unfiltered catalog.
- **Expected Behavior**: Clearing the input should immediately reload the category's full product catalog.
- **Fix / Hint**:
  ```javascript
  // In frontend/src/App.jsx
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      fetchProducts(activeCategory, query.trim(), sortBy);
    } else {
      fetchProducts(activeCategory, '', sortBy);
    }
  };
  ```

---

### 🔴 Frontend React Issue #5: LocalStorage Cart Serialization Syntax Error on Reload
- **File**: [frontend/src/App.jsx](file:///Users/satyamkumar/Desktop/test_repo/frontend/src/App.jsx) (`useEffect` with `localStorage.setItem`)
- **Severity**: Medium (State Persistence Failure)
- **Symptom**: On page refresh, items saved in the cart disappear or cause a JSON parsing warning in the console because objects were saved without `JSON.stringify()`.
- **Steps to Reproduce**:
  1. Add an item to the cart.
  2. Inspect `Application > LocalStorage` in DevTools; `novashop_cart` is stored as `[object Object]`.
  3. Refresh the page; cart resets to 0 items.
- **Expected Behavior**: Cart items should persist across page refreshes.
- **Fix / Hint**:
  ```javascript
  // In frontend/src/App.jsx
  // Change:
  useEffect(() => {
    try {
      localStorage.setItem('novashop_cart', cart);
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [cart]);
  
  // To:
  useEffect(() => {
    try {
      localStorage.setItem('novashop_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [cart]);
  ```

---

## ⚙️ Part 2: Backend Express Issues

### 🔴 Backend Issue #1: Category Filter Case Sensitivity & Limit Off-By-One Error
- **File**: [backend/server.js](file:///Users/satyamkumar/Desktop/test_repo/backend/server.js) (`GET /api/products`)
- **Severity**: Medium (API Query Failure)
- **Symptom**:
  1. Querying `/api/products?category=audio` returns 0 products because it strictly matches `'Audio'`.
  2. Requesting `?limit=5` returns only 4 products due to `slice(0, parsedLimit - 1)`.
  3. Title search fails on lowercase queries because `p.title.includes(search)` lacks `.toLowerCase()`.
- **Steps to Reproduce**:
  - `curl "http://localhost:5001/api/products?category=audio"` (returns 0 items).
  - `curl "http://localhost:5001/api/products?limit=5"` (returns 4 items).
- **Expected Behavior**: Case-insensitive filtering and correct pagination limits.
- **Fix / Hint**:
  ```javascript
  if (category && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }
  if (limit && !isNaN(limit)) {
    result = result.slice(0, parseInt(limit, 10));
  }
  ```

---

### 🔴 Backend Issue #2: Cart Quantity String Concatenation & Missing Stock Validation
- **File**: [backend/server.js](file:///Users/satyamkumar/Desktop/test_repo/backend/server.js) (`POST /api/cart/add`)
- **Severity**: High (Data Integrity Bug)
- **Symptom**: If the client sends quantity as a string (e.g. `quantity: "1"`), adding an existing cart item with quantity 2 mutates the quantity to `"21"` (21 items) instead of `3`.
- **Steps to Reproduce**:
  - Post to `/api/cart/add` with `{"productId": 1, "quantity": "1"}` twice.
  - Inspect cart response; item quantity becomes `"11"`.
- **Expected Behavior**: Quantity should be parsed with `Number(quantity)` or `parseInt(quantity, 10)`.
- **Fix / Hint**:
  ```javascript
  const parsedQty = parseInt(quantity, 10) || 1;
  cart[existingItemIndex].quantity += parsedQty;
  ```

---

### 🔴 Backend Issue #3: Coupon Logic Vulnerability & Bad Status Code
- **File**: [backend/server.js](file:///Users/satyamkumar/Desktop/test_repo/backend/server.js) (`POST /api/coupons/apply`)
- **Severity**: High (Business Logic Vulnerability)
- **Symptom**:
  1. Invalid coupon codes return HTTP `200 OK` with `{ success: false }` instead of HTTP `400 Bad Request`.
  2. Coupon codes can be applied repeatedly without checking if they were already used in the active session.
  3. Fixed discounts (like `FLAT50`) do not clamp to $0 minimum if subtotal is smaller than discount.
- **Steps to Reproduce**:
  - Send `POST /api/coupons/apply` with `{"code": "INVALID_CODE"}`. Observe HTTP 200 response.
  - Re-apply `SAVE20` multiple times to stack discounts.
- **Expected Behavior**: Return 400 on bad codes and disallow coupon stacking.
- **Fix / Hint**:
  ```javascript
  if (!coupon) {
    return res.status(400).json({ success: false, message: 'Invalid promo code' });
  }
  ```

---

### 🔴 Backend Issue #4: Checkout Uncaught TypeError & Missing Inventory Decrement
- **File**: [backend/server.js](file:///Users/satyamkumar/Desktop/test_repo/backend/server.js) (`POST /api/checkout`)
- **Severity**: Critical (Server Crash & Inventory Leak)
- **Symptom**:
  1. If `shippingAddress` is missing in request body, accessing `shippingAddress.street` causes an unhandled `TypeError` that crashes the request with a 500 status.
  2. When an order succeeds, `product.stock` is NEVER reduced in the database.
- **Steps to Reproduce**:
  - Send `POST /api/checkout` with `{ "items": [{ "id": 1, "quantity": 2 }] }` without `shippingAddress`. Server crashes with `Cannot read properties of undefined (reading 'street')`.
  - Place an order and then fetch `/api/products/1`; the stock remains at original quantity.
- **Expected Behavior**: Validate input with 400 response and deduct purchased quantities from `product.stock`.
- **Fix / Hint**:
  ```javascript
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
    return res.status(400).json({ success: false, message: 'Incomplete shipping address' });
  }
  
  // Deduct stock:
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.quantity;
    }
  }
  ```

---

### 🔴 Backend Issue #5: Order Lookup Route ID Property Mismatch
- **File**: [backend/server.js](file:///Users/satyamkumar/Desktop/test_repo/backend/server.js) (`GET /api/orders/:id`)
- **Severity**: Medium (API 404 Bug)
- **Symptom**: Fetching an order by its ID returns `404 Not Found` even when the order exists, because the backend compares against `order.id` instead of `order.orderId`.
- **Steps to Reproduce**:
  1. Complete a purchase to generate an order (e.g. `ORD-123456`).
  2. Send `GET /api/orders/ORD-123456`.
  3. The endpoint returns 404 `{ success: false, message: "Order not found" }`.
- **Expected Behavior**: Find order by matching `order.orderId === requestedId`.
- **Fix / Hint**:
  ```javascript
  // Change:
  const order = orders.find(o => o.id === requestedId);
  
  // To:
  const order = orders.find(o => o.orderId === requestedId);
  ```

---

## 📋 Verification Checklist

| Area | Issue Description | Fixed? |
|---|---|:---:|
| **Frontend (React)** | Fix string concatenation in grand total calculation (`CartDrawer.jsx`) | ⬜ |
| **Frontend (React)** | Fix Quick View modal image updating on product changes (`QuickViewModal.jsx`) | ⬜ |
| **Frontend (React)** | Fix checkout email regex and assignment operator (`CheckoutModal.jsx`) | ⬜ |
| **Frontend (React)** | Add fallback search reset when input is cleared (`App.jsx`) | ⬜ |
| **Frontend (React)** | Add `JSON.stringify` to cart localStorage persistence (`App.jsx`) | ⬜ |
| **Backend (Express)** | Case-insensitive product search, category matching, and limit slice | ⬜ |
| **Backend (Express)** | Sanitize cart quantity parsing to prevent string concatenation | ⬜ |
| **Backend (Express)** | Return 400 on invalid coupons and prevent stacked duplicate coupons | ⬜ |
| **Backend (Express)** | Add `shippingAddress` validation check and deduct inventory on checkout | ⬜ |
| **Backend (Express)** | Fix property name in order lookup (`orderId` vs `id`) | 0 |
