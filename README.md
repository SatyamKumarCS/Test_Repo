# ⚡ NovaShop — Fullstack React & Node.js E-Commerce Debugging Challenge

> A modern, responsive e-commerce web application built with **React (Vite)** and **Express**, featuring intentional frontend and backend bugs designed for developer assessments, debugging practice, code review training, and technical interviews.

---

## 📖 Overview

**NovaShop** is a tech and lifestyle goods e-commerce storefront. The project features a complete end-to-end shopping flow:
- **Product Catalog**: Dynamic catalog with category filtering, search, and sorting.
- **Product Details**: Quick-view modal with detailed specs, ratings, and quantity selector.
- **Cart Management**: Slide-out cart drawer with real-time quantity adjustments and item deletion.
- **Promotions & Discounts**: Promo code application (`SAVE10`, `SAVE20`, `FLAT50`).
- **Checkout Flow**: Multi-field checkout with form validation, address handling, and order summary receipt.
- **UI & Theme**: Dark/Light mode toggle, micro-interactions, responsive design, Lucide icons, and toast notifications.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Modern CSS (Glassmorphism, Flexbox/Grid, CSS Variables, Dark/Light Themes).
- **Backend**: Node.js, Express.js, CORS.
- **Data Store**: In-memory JSON mock dataset (`backend/data/products.json`).

---

## 📂 Project Structure

```text
test_repo/
├── backend/
│   ├── data/
│   │   └── products.json         # Product catalog mock dataset
│   ├── package.json              # Backend dependencies (Express, CORS)
│   └── server.js                 # Express API server & static React host
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CartDrawer.jsx       # Slide-out cart drawer (Bug #1)
│   │   │   ├── CheckoutModal.jsx    # Checkout form modal (Bug #3)
│   │   │   ├── Hero.jsx             # Hero section
│   │   │   ├── Navbar.jsx           # Top navigation & theme toggle
│   │   │   ├── OrderSuccessModal.jsx# Receipt confirmation modal
│   │   │   ├── ProductCard.jsx      # Individual product card
│   │   │   ├── ProductGrid.jsx      # Catalog grid with filters
│   │   │   ├── QuickViewModal.jsx   # Product preview modal (Bug #2)
│   │   │   └── Toast.jsx            # Toast notification container
│   │   ├── App.jsx                  # Main state orchestrator (Bugs #4 & #5)
│   │   ├── index.css                # Design system & styles
│   │   └── main.jsx                 # React root entry point
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies (React, Vite, Lucide)
│   └── vite.config.js               # Vite config with backend API proxy
├── package.json                  # Root npm scripts
├── issues.md                     # ⚠️ Complete list of intentional frontend & backend bugs
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or newer)
- **npm** (v9.x or newer)

### 1. Installation

From the project root directory, install all dependencies for both backend and frontend:

```bash
npm run install:all
```

*(Or `cd backend && npm install && cd ../frontend && npm install`)*

### 2. Running in Development Mode

You can run both or either of the development servers:

**Option A: Run Fullstack Production Build (Recommended)**
```bash
npm run build:frontend
npm start
```
Then navigate to: **http://localhost:5001**

**Option B: Run React Vite Dev Server with Live Reload**
```bash
# Terminal 1 (Backend API):
npm run dev:backend

# Terminal 2 (React Vite Frontend with API Proxy):
npm run dev:frontend
```
Then navigate to: **http://localhost:3000** (proxies API requests to port 5001)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve catalog items with query filters (`category`, `search`, `sortBy`, `limit`) |
| `GET` | `/api/products/:id` | Get details of a single product by ID |
| `GET` | `/api/cart` | Get current active cart items and subtotal |
| `POST` | `/api/cart/add` | Add an item to the cart (`{ productId, quantity }`) |
| `DELETE` | `/api/cart/:id` | Remove an item from the cart |
| `POST` | `/api/coupons/apply` | Apply discount promo code (`{ code, subtotal }`) |
| `POST` | `/api/checkout` | Process order checkout (`{ items, shippingAddress, paymentMethod, total }`) |
| `GET` | `/api/orders/:id` | Retrieve an order by Order ID |

---

## 🧪 Debugging Challenge Instructions

This repository has been intentionally seeded with **5 Frontend React Bugs** and **5 Backend Express Bugs**.

For the comprehensive catalog of issues, reproduction steps, root causes, and hints, refer to [issues.md](file:///Users/satyamkumar/Desktop/test_repo/issues.md).

### Recommended Workflow for Candidates / Learners:
1. **Explore the UI**: Add items to your cart, apply promo codes, search, open modal previews, and attempt checkout.
2. **Observe the Console & Network Tabs**: Inspect API responses, React state warnings, and JS errors in DevTools.
3. **Locate and Fix the Bugs**: Reference the React components in [frontend/src/](file:///Users/satyamkumar/Desktop/test_repo/frontend/src/) and [backend/server.js](file:///Users/satyamkumar/Desktop/test_repo/backend/server.js).
4. **Verify**: Ensure the complete shopping and checkout lifecycle works without errors.
