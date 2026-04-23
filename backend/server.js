const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Load env vars from backend/.env explicitly (avoids relying on cwd)
dotenv.config({ path: path.resolve(__dirname, '.env') });

// STEP 15: ENV VALIDATION
const requiredEnvs = ['PORT', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
for (const env of requiredEnvs) {
    if (!process.env[env]) {
        console.error(`❌ FATAL ERROR: Missing required environment variable: ${env}`);
        process.exit(1);
    }
}

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Frontend uses inline scripts/styles
    crossOriginEmbedderPolicy: false // Allow loading external fonts/images
}));
app.use(cors({
    origin: function (origin, callback) {
        // Allows any dynamic frontend (Vercel/Netlify preview links) to connect safely
        callback(null, origin || true);
    },
    credentials: true
}));
// Use crypto to generate correlation id
const crypto = require('crypto');
const morgan = require('morgan');

app.use(morgan('dev')); // STEP 8: LOGGING

app.use((req, res, next) => {
    req.correlationId = crypto.randomUUID();
    next();
});

app.use(express.json({ limit: '1mb' }));

// Main Backend API Routes will be imported here
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// API Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Safe limit for normal browsing + assets
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const orderLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 40, // Relaxed heavily for robust UX flows and UX
    message: { success: false, message: 'Too many orders, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login/register attempts
    message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

// Use Routes
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Simple health check
app.get('/api/health', async (req, res) => {
    try {
        const pool = require('./config/db');
        const [rows] = await pool.query('SELECT 1');
        res.status(200).json({ success: true, message: 'API is running...', data: { db: 'connected' } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'API running but DB disconnected', data: { error: err.message } });
    }
});

// Serve Static Frontend Files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback for SPA routing: send index.html for all unknown non-API routes
app.get('*', (req, res) => {
    if(!req.path.startsWith('/api/')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).json({ success: false, message: 'API Route Not Found' });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    // Handle malformed JSON bodies
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON in request body'
        });
    }
    // Handle payload too large
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Request body too large'
        });
    }

    console.error('❌ Global Error:', err.message);
    console.error(err.stack);
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

// Verify DB connection before starting server
const pool = require('./config/db');
pool.getConnection()
    .then(async conn => {
        try {
            // Test basic connectivity first
            await conn.query('SELECT 1');
            console.log('✅ MySQL connection verified (SELECT 1 passed)');

            // Verify required views exist; if not, create them idempotently
            await conn.query(`
                CREATE OR REPLACE VIEW vw_product_summary AS
                SELECT 
                    p.id, p.title, p.product_brand, c.name AS category_name,
                    p.price,
                    p.discount_price,
                    IFNULL(p.discount_price, p.price) AS active_price,
                    p.tax_percentage,
                    ROUND(IFNULL(p.discount_price, p.price) + (IFNULL(p.discount_price, p.price) * p.tax_percentage / 100), 2) AS price_with_gst,
                    COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
                    COUNT(r.id) AS total_reviews
                FROM products p
                JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON r.product_id = p.id
                GROUP BY p.id, p.title, p.product_brand, c.name, p.price, p.discount_price, p.tax_percentage;
            `);
            
            await conn.query(`
                CREATE OR REPLACE VIEW vw_cart_summary_with_tax AS
                SELECT 
                    c.user_id,
                    SUM(c.quantity * IFNULL(p.discount_price, p.price)) AS cart_subtotal,
                    SUM(c.quantity * IFNULL(p.discount_price, p.price) * (p.tax_percentage / 100)) AS total_gst,
                    SUM(c.quantity * IFNULL(p.discount_price, p.price) + c.quantity * IFNULL(p.discount_price, p.price) * (p.tax_percentage / 100)) AS cart_grand_total
                FROM cart c
                JOIN products p ON c.product_id = p.id
                GROUP BY c.user_id;
            `);
            console.log('✅ Required database views verified/created');
        } catch (err) {
            console.error('❌ Schema validation failed (missing tables for views):', err.message);
            process.exit(1);
        } finally {
            conn.release();
        }

        console.log('✅ MySQL database connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api/health`);
        });
    })
    .catch(err => {
        console.error('❌ MySQL connection failed:');
        console.error(`   Error Code: ${err.code}`);
        console.error(`   Error Message: ${err.message}`);
        console.error('   Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
        // Fail clearly if DB config is invalid
        process.exit(1);
    });
