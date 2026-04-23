const pool = require('../config/db');

const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const [reviews] = await pool.query(`
            SELECT r.*, u.full_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [productId]);

        const [agg] = await pool.query(`
            SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating), 0) as average_rating 
            FROM reviews WHERE product_id = ?
        `, [productId]);

        res.status(200).json({
            success: true,
            message: 'Reviews fetched',
            data: {
                reviews,
                total_reviews: agg[0].total_reviews,
                average_rating: parseFloat(parseFloat(agg[0].average_rating).toFixed(1))
            }
        });
    } catch (error) {
        next(error);
    }
};

const addReview = async (req, res, next) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user.id; 

        if (!product_id || !rating) {
            return res.status(400).json({ success: false, message: 'Product ID and Rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const [orderCheck] = await pool.query(`
            SELECT oi.id 
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'Delivered'
            LIMIT 1
        `, [product_id, user_id]);
        
        if (orderCheck.length === 0) {
            return res.status(403).json({ success: false, message: 'You can only review products you have purchased and received.' });
        }

        const query = `
            INSERT INTO reviews (product_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                rating = VALUES(rating),
                comment = VALUES(comment),
                created_at = CURRENT_TIMESTAMP
        `;

        await pool.query(query, [product_id, user_id, rating, comment || null]);

        res.status(200).json({ success: true, message: 'Review saved successfully!' });
    } catch (error) {
        next(error);
    }
};

module.exports = { addReview, getProductReviews };
