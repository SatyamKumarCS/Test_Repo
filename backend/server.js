const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static React build files
const frontendDist = path.join(__dirname, '../frontend/dist');
const frontendStatic = path.join(__dirname, '../frontend');
app.use(express.static(fs.existsSync(frontendDist) ? frontendDist : frontendStatic));

// Load mock product data in memory
const productsFilePath = path.join(__dirname, 'data', 'products.json');
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// In-memory state for active sessions & orders
let cart = [];
let orders = [];
let appliedCoupons = [];

// Available coupon codes
const VALID_COUPONS = {
  'SAVE10': { type: 'percentage', value: 10, minSpend: 50 },
  'SAVE20': { type: 'percentage', value: 20, minSpend: 100 },
  'FLAT50': { type: 'fixed', value: 50, minSpend: 150 }
};

/**
 * ==========================================
 * BACKEND API ROUTES
 * ==========================================
 */

/**
 * GET /api/products
 * Query Params: category, search, sortBy, limit
 * 
 * [BACKEND BUG #1]: 
 * - Search query filter is case-sensitive and misses lowercase searches.
 * - Category filter is strictly case sensitive ('audio' fails when category is 'Audio').
 * - Limit pagination has an off-by-one bug: slice(0, limit - 1) instead of slice(0, limit).
 */
app.get('/api/products', (req, res) => {
  try {
    let result = [...products];
    const { category, search, sortBy, limit } = req.query;

    // BUG: Strict case-sensitive match
    if (category && category !== 'All') {
      result = result.filter(p => p.category === category); 
    }

    // BUG: Search lacks .toLowerCase() on title
    if (search) {
      result = result.filter(p => p.title.includes(search));
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    // BUG: Off-by-one error with limit
    if (limit && !isNaN(limit)) {
      const parsedLimit = parseInt(limit, 10);
      result = result.slice(0, parsedLimit - 1); 
    }

    res.json({
      success: true,
      count: result.length,
      products: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * GET /api/products/:id
 */
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
});

/**
 * GET /api/cart
 */
app.get('/api/cart', (req, res) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.json({
    success: true,
    items: cart,
    subtotal: parseFloat(subtotal.toFixed(2))
  });
});

/**
 * POST /api/cart/add
 * Body: { productId, quantity }
 * 
 * [BACKEND BUG #2]:
 * - If item exists, quantity addition concatenates strings if req.body.quantity is string type
 *   (e.g., qty 1 + "2" becomes "12" instead of 3).
 * - Doesn't validate if quantity requested exceeds available stock on add.
 */
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === parseInt(productId, 10));

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const existingItemIndex = cart.findIndex(item => item.id === product.id);

  if (existingItemIndex > -1) {
    // BUG: Potential string concatenation when quantity is sent as a string or without Number casting
    cart[existingItemIndex].quantity = cart[existingItemIndex].quantity + quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  res.json({ success: true, message: 'Item added to cart', cart });
});

/**
 * DELETE /api/cart/:id
 */
app.delete('/api/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  cart = cart.filter(item => item.id !== productId);
  res.json({ success: true, message: 'Item removed', cart });
});

/**
 * POST /api/coupons/apply
 * Body: { code, subtotal }
 * 
 * [BACKEND BUG #3]:
 * - Allows multiple coupon codes stacking without resetting previous discount.
 * - Does not check if discount exceeds subtotal, allowing 0 or negative final amounts.
 * - Inaccurate status codes: returns 200 OK with success:false when coupon is invalid.
 */
app.post('/api/coupons/apply', (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = VALID_COUPONS[code ? code.toUpperCase() : ''];

  if (!coupon) {
    // BUG: Returns 200 status code for bad coupon input instead of 400
    return res.status(200).json({ success: false, message: 'Invalid promo code' });
  }

  if (subtotal < coupon.minSpend) {
    return res.status(200).json({ 
      success: false, 
      message: `Minimum spend of $${coupon.minSpend} required for this coupon` 
    });
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (subtotal * coupon.value) / 100;
  } else {
    discountAmount = coupon.value;
  }

  // BUG: Stacking coupons infinitely without checking if code was already applied
  appliedCoupons.push(code);

  res.json({
    success: true,
    code: code.toUpperCase(),
    discount: parseFloat(discountAmount.toFixed(2)),
    newTotal: parseFloat((subtotal - discountAmount).toFixed(2))
  });
});

/**
 * POST /api/checkout
 * Body: { items, shippingAddress, paymentMethod, total }
 * 
 * [BACKEND BUG #4]:
 * - Uncaught TypeError when shippingAddress is missing or undefined (accesses shippingAddress.street directly without optional chaining).
 * - Does not decrement stock from the products database upon successful checkout.
 */
app.post('/api/checkout', (req, res) => {
  const { items, shippingAddress, paymentMethod, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  // BUG: Direct property access on shippingAddress without null check -> causes server 500 crash if missing
  const fullAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zipCode}`;

  // BUG: Verifies stock exists, but fails to deduct items from inventory!
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock for ${item.title}` 
      });
    }
    // MISSING: product.stock -= item.quantity;
  }

  const newOrder = {
    orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    items,
    shippingAddress: fullAddress,
    paymentMethod: paymentMethod || 'Credit Card',
    total: parseFloat(total),
    createdAt: new Date().toISOString(),
    status: 'Confirmed'
  };

  orders.push(newOrder);
  // Clear cart
  cart = [];
  appliedCoupons = [];

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order: newOrder
  });
});

/**
 * GET /api/orders/:id
 * 
 * [BACKEND BUG #5 - FIXED]:
 * - Looks up the order by its actual `orderId` property instead of the non-existent `id`.
 */
app.get('/api/orders/:id', (req, res) => {
  const requestedId = req.params.id;
  // FIX: Match against orderId (the property actually set on the order object)
  const order = orders.find(o => o.orderId === requestedId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order });
});

// Catch-all route for Single Page Application
app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 NovaShop E-Commerce Server running at http://localhost:${PORT}`);
});
