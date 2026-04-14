# Luna – Full-Stack E-commerce Platform

Luna is a full-stack e-commerce web application designed to provide a seamless online shopping experience. It includes product browsing, cart management, and order processing features backed by a Node.js and MySQL architecture.

---

## Features

- Complete Shopping Flow: From browsing to a streamlined checkout process.
- Secure Authentication: User login and registration with encrypted passwords (bcrypt).
- Real-time Cart Management: Dynamic cart updates with accurate total calculations.
- Order Tracking: Personal dashboard to view order history, payment status, and delivery tracking.
- Product Reviews: Interactive rating system for users to share feedback.
- Responsive Design: Elegant interface with mobile-first layouts.
- Optimized Database: MySQL schema normalized to 3NF for scalability.

---

## Tech Stack

### Frontend
- HTML5 & CSS3: Custom vanilla styles.
- JavaScript (ES6+): Reactive components without heavy framework overhead.
- Responsive Design: Fluid layouts for all screen sizes.

### Backend
- Node.js & Express: RESTful API server.
- MySQL: Relational database for structured data management.
- JWT & Bcrypt: Secure session management and password hashing.
- Dotenv: Centralized environment configuration.

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)

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
   mysql -u root -p ecommerce_db < database/schema.sql
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

## Project Structure

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
├── database/           # Database schemas and documentation
├── .env.example        # Environment variables template
└── package.json        # Project metadata and dependencies
```
