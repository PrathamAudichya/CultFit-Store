# CultFit Store — Full-Stack E-commerce Platform

A fully functional, production-ready E-commerce web application built with Node.js, Express, MySQL, and Vanilla JavaScript. Features user authentication, a dynamic shopping cart, mock payment system, MVC architecture, and a robust MySQL backend.

## Features

- **MVC Architecture**: Clean separation of routes, controllers, and database access logic.
- **Mock Payment System**: Custom COD and Dummy Card logic (No third-party payment gateways required like Razorpay).
- **Cart & Checkout**: Dynamic price calculation, real-time stock verification, and server-side coupon validation.
- **Stock Management**: Inventory is verified and decremented securely using MySQL transactions during checkout.
- **Input Validation**: Joi middleware validation for critical routes (Auth, Cart, Order placement).
- **Error Handling**: Global error handling middleware and environment validation to prevent server crashes.
- **Standardized API Responses**: All APIs follow `{ success, message, data }` response format.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL2 (with connection pooling)
- **Validation**: Joi
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Logging**: Morgan
- **Frontend**: HTML, CSS, Vanilla JavaScript

## Project Setup & Execution

### Prerequisites

Ensure you have the following installed:
- Node.js (v14+)
- MySQL Server (e.g., XAMPP, MySQL Workbench, or standalone)

### 1. Database Setup

1. Login to your MySQL server.
2. Create a database named `ecommerce_db`:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```
3. Import the database schema:
   ```bash
   mysql -u root -p ecommerce_db < database/schema.sql
   ```

### 2. Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=supersecretjwtkey_12345
```

> **Note**: The backend will fail to start if any of these variables are missing!

### 3. Install Dependencies & Run

From the **project root**, install dependencies and start the server:

```bash
npm install
npm run dev
```

The server will be available at `http://localhost:5000`. The backend serves the frontend automatically — no separate static server needed.

## Important Backend Endpoints

### Health Check
- `GET /api/health` - Check database connectivity and server status.

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login to account

### Products & Cart
- `GET /api/products` - Fetch all products
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `POST /api/coupons/validate` - Validate a discount coupon

### Checkout
- `POST /api/orders` - Place an order (simulates dummy payment and performs stock reduction inside a MySQL transaction)

## Mock Payment System Guide

At the checkout page, you can select the following options:
1. **Cash on Delivery (COD)**: Always succeeds. Order status becomes `Pending`.
2. **Card Payment**: Enter a dummy card number.
   - If the card number is `1111`, the transaction will **fail**.
   - Any other card number will **succeed**.

## Project Structure

```
CultFit-Store/
├── backend/
│   ├── config/          # Database connection pool
│   ├── controllers/     # Business logic
│   ├── middlewares/      # Auth middleware
│   ├── routes/          # API route definitions
│   ├── validators/      # Joi validation schemas
│   └── server.js        # Express app entry point
├── frontend/
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   ├── images/          # Product images
│   └── *.html           # Pages (index, products, cart, checkout, etc.)
├── database/
│   ├── schema.sql       # Full database schema (tables, views, triggers)
│   └── README.md        # Database setup notes
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

## Recent Architectural Upgrades
- Completely removed `razorpay` dependencies to simplify local testing.
- Introduced `Joi` validation schemas for inputs.
- Extracted business logic from routing files into specific controller files inside `backend/controllers`.
- Integrated Global Error Handlers and structured logging (`morgan`).
