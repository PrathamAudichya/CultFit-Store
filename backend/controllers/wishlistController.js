const pool = require('../config/db');

// @desc    Get user's wishlist
exports.getWishlist = async (req, res, next) => {
    try {
        const [wishlistItems] = await pool.query(`
            SELECT w.id as wishlist_id, p.id, p.title, p.price, p.discount_price, p.product_brand, pi.image_url 
            FROM wishlist w
            JOIN products p ON w.product_id = p.id 
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
            WHERE w.user_id = ?
            ORDER BY w.added_at DESC
        `, [req.user.id]);
        res.status(200).json({ success: true, message: 'Wishlist fetched', data: wishlistItems });
    } catch (error) {
        next(error);
    }
};

// @desc    Add product to wishlist
exports.addToWishlist = async (req, res, next) => {
    const { productId } = req.body;
    try {
        await pool.query(
            'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', 
            [req.user.id, productId]
        );
        res.status(201).json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove product from wishlist
exports.removeFromWishlist = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
        res.status(200).json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
        next(error);
    }
};
