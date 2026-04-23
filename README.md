# 🏋️ CultFit Store — Full-Stack E-commerce Platform

> A production-ready fitness supplement & equipment store built with Node.js, Express, MySQL, and Vanilla JavaScript.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup MySQL database
mysql -u root -p -e "CREATE DATABASE ecommerce_db;"
mysql -u root -p ecommerce_db < database/schema.sql

# 3. Configure environment
cp .env.example backend/.env
# Edit backend/.env with your MySQL credentials

# 4. Start the server
npm run dev

# 5. Open in browser
# → http://localhost:5000
```

---

## 📸 Screenshots

| Home | Shop | Cart |
|------|------|------|
| ![Home](docs/screenshots/home.png) | ![Shop](docs/screenshots/products.png) | ![Cart](docs/screenshots/cart.png) |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup, login, and session management
- 🛒 **Dynamic Cart** — Add, update, remove items with real-time totals
- 💰 **Smart Pricing** — Automatic GST calculation, discount prices, and coupon system
- 📦 **Order Management** — Place orders, view history, cancel, and leave feedback
- 🔍 **Product Search & Filters** — Search by name/brand, filter by category and price range
- ❤️ **Wishlist** — Save products for later
- 🌙 **Dark Mode** — Toggle between light and dark themes
- 💳 **Mock Payment** — COD and dummy card payment (no real charges)
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MySQL2 (connection pooling) |
| **Auth** | JWT, bcryptjs |
| **Validation** | Joi |
| **Logging** | Morgan |
| **Security** | Helmet, CORS, Rate Limiting |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |

---

## 📂 Project Structure

```
CultFit-Store/
├── backend/
│   ├── config/          # Database connection pool
│   ├── controllers/     # Business logic (auth, cart, orders, products)
│   ├── middlewares/      # JWT auth & Joi validation middleware
│   ├── routes/          # Express route definitions
│   ├── validators/      # Joi validation schemas
│   └── server.js        # App entry point
├── frontend/
│   ├── css/             # Stylesheets (dark mode, glassmorphism)
│   ├── js/              # API client, config, shared logic
│   ├── images/          # Product images
│   └── *.html           # Pages (home, shop, cart, checkout, dashboard)
├── database/
│   ├── schema.sql       # Tables, views, indexes, triggers
│   └── seed.sql         # Optional sample data
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server & DB health check |
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Login & receive JWT |
| `/api/products` | GET | List all products (supports filters) |
| `/api/cart` | GET/POST | View or sync cart |
| `/api/orders` | POST | Place an order |
| `/api/wishlist` | GET/POST/DELETE | Manage wishlist |
| `/api/coupons/validate` | POST | Validate discount coupon |

> All endpoints return `{ success, message, data }` format.

---

## 💳 Mock Payment Guide

| Method | Behavior |
|--------|----------|
| **Cash on Delivery** | Always succeeds |
| **Card Payment** | Enter any card number to succeed |
| **Card `1111`** | Simulates payment failure |

---

## 📋 Environment Variables

Create `backend/.env` using `.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
JWT_SECRET=your_secret_key
```

---

## 📝 Notes

- This is a **demo/learning project** — not intended for real transactions
- Payment is fully simulated (no real payment gateway)
- The backend serves the frontend — no separate static server needed

---

## 📄 License

MIT
