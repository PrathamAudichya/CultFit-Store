const pool = require('../config/db');

const addReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user.id; // from auth middleware

        if (!product_id || !rating) {
            return res.status(400).json({ message: 'Product ID and Rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
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

        res.status(200).json({ message: 'Review saved successfully!' });
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({ message: 'Server error saving review' });
    }
};

module.exports = { addReview };
