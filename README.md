# 🏋️ CultFit Store - Premium E-commerce Platform

[![Banner](./docs/images/banner.png)](https://github.com/PrathamAudichya/Luna)

**CultFit Store** is a full-stack, production-ready e-commerce solution designed for fitness enthusiasts. Built with a focus on premium aesthetics and performance, it features a seamless shopping experience from product discovery to secure checkout.

---

## 🌟 Features

- **🛍️ Complete Shopping Flow**: From browsing high-end fitness gear to a streamlined checkout process.
- **🔐 Secure Authentication**: Robust user login and registration with encrypted passwords (bcrypt).
- **🛒 Real-time Cart Management**: Dynamic cart updates with accurate total calculations.
- **📦 Order Tracking**: Personal dashboard to view order history, payment status, and delivery tracking.
- **⭐ Product Reviews**: Interactive rating system for users to share feedback and photos.
- **🌙 Modern Design**: Elegant dark-mode interface with responsive, mobile-first layouts.
- **📊 Optimized Database**: MySQL schema normalized to 3NF for scalability and integrity.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom vanilla styles for a premium look.
- **JavaScript (ES6+)**: Reactive components without heavy framework overhead.
- **Responsive Design**: Fluid layouts for all screen sizes.

### Backend
- **Node.js & Express**: High-performance RESTful API server.
- **MySQL**: Relational database for structured data management.
- **JWT & Bcrypt**: Secure session management and password hashing.
- **Dotenv**: Centralized environment configuration.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/PrathamAudichya/Luna.git
cd Project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup
1. Create a MySQL database named `ecommerce_db`.
2. Import the initial schema:
   ```bash
   mysql -u root -p ecommerce_db < update_products_final.sql
   ```

### 4. Environment Configuration
Create a `.env` file in the root directory and add your credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
JWT_SECRET=your_jwt_secret
```

### 5. Start the Application
```bash
# To start the server
npm start

# For development (with nodemon)
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/            # Express server, routes, and controllers
│   ├── config/         # Database and middleware configuration
│   ├── controllers/    # Request handling logic
│   └── routes/         # API endpoint definitions
├── frontend/           # Client-side files
│   ├── css/            # Stylings and themes
│   ├── images/         # Local assets and product shots
│   ├── js/             # Application logic and cart handling
│   └── *.html          # Core application pages
├── docs/               # Architecture and design documentation
├── .env                # Environment variables (do not commit)
└── package.json        # Project metadata and dependencies
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Pratham Audichya](https://github.com/PrathamAudichya)
