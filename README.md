# CultFit Store - Full-Stack E-commerce Solution

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**CultFit Store** is a production-ready, full-stack e-commerce platform designed for fitness enthusiasts. It features a modern, responsive frontend, a robust Node.js backend, and a secure MySQL database integration.

## 🚀 Key Features

- **Dynamic Product Catalog**: Seamlessly browse curated fitness supplements and equipment.
- **Advanced Cart System**: Real-time cart updates and state synchronization across browser sessions.
- **Coupons & Discounts**: Integrated validation system for flexible promotional campaigns.
- **Automated Order Tracking**: Sophisticated order lifecycle management (Pending $\rightarrow$ Shipped $\rightarrow$ Delivered) with simulated logic.
- **User Reviews & Ratings**: Community-driven feedback system for every product.
- **Premium UI/UX**: Dark-theme aesthetics with glassmorphism, smooth animations, and pixel-perfect alignment.
- **Secure Authentication**: JWT-based session management and encrypted user credentials.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Modern Flexbox/Grid).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (Optimized schema with relational integrity).
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js.
- **Styling**: Modern dark-theme UI with responsive design patterns.

## 📁 Project Structure

```text
├── backend/
│   ├── config/      # Database and environment configurations
│   ├── database/    # SQL migration and schema scripts
│   ├── middleware/  # Authentication and error-handling
│   ├── routes/      # Express API endpoints
│   └── server.js    # Backend entry point
├── frontend/
│   ├── css/         # Modular CSS components
│   ├── images/      # Product and UI assets
│   ├── js/          # Frontend logic and state management
│   └── *.html       # Responsive UI pages
└── scripts/         # Development and maintenance utilities
```

## ⚙️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PrathamAudichya/Luna.git
   cd Luna
   ```

2. **Backend Configuration**:
   - Install dependencies: `npm install`
   - Create a `.env` file based on `.env.example`.
   - Setup your MySQL database using `backend/database/schema.sql`.

3. **Run the Application**:
   - Start the server: `npm run dev`
   - Open `frontend/index.html` in your browser.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Developed with ❤️ by [PrathamAudichya](https://github.com/PrathamAudichya)
