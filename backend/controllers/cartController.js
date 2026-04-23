const pool = require('../config/db');

// @desc    Get user cart details with product info
exports.getUserCart = async (req, res, next) => {
    try {
        const [cartItems] = await pool.query(`
            SELECT c.id as cart_id, c.quantity, p.id, p.title, p.price, p.discount_price, p.tax_percentage, p.product_brand, pi.image_url 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
            WHERE c.user_id = ?
        `, [req.user.id]);
        
        let subtotal = 0;
        let totalGst = 0;

        const enhancedCart = cartItems.map(item => {
            const price         = parseFloat(item.price)          || 0;
            const discountPrice = item.discount_price != null ? parseFloat(item.discount_price) : null;
            const taxPct        = parseFloat(item.tax_percentage)  || 18;
            const qty           = parseInt(item.quantity)          || 1;

            const activePrice = discountPrice !== null ? discountPrice : price;
            const itemTotal   = activePrice * qty;
            const itemGst     = itemTotal * (taxPct / 100);

            subtotal += itemTotal;
            totalGst += itemGst;

            return {
                ...item,
                price,
                discount_price: discountPrice,
                tax_percentage: taxPct,
                quantity:       qty,
                active_price:   activePrice,
                item_total:     parseFloat(itemTotal.toFixed(2)),
                item_gst:       parseFloat(itemGst.toFixed(2)),
                total_with_gst: parseFloat((itemTotal + itemGst).toFixed(2))
            };
        });

        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            data: {
                items: enhancedCart,
                summary: {
                    cart_subtotal:    parseFloat(subtotal.toFixed(2)),
                    total_gst:        parseFloat(totalGst.toFixed(2)),
                    cart_grand_total: parseFloat((subtotal + totalGst).toFixed(2))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get cart summary from View (DBMS specific)
exports.getCartSummary = async (req, res, next) => {
    try {
        const [summary] = await pool.query('SELECT * FROM vw_cart_summary_with_tax WHERE user_id = ?', [req.user.id]);
        if (summary.length > 0) {
            res.status(200).json({ success: true, message: 'Summary fetched', data: summary[0] });
        } else {
            res.status(200).json({ success: true, message: 'Summary fetched (empty)', data: { cart_subtotal: 0, total_gst: 0, cart_grand_total: 0 } });
        }
    } catch(err) {
        next(err);
    }
};

// @desc    Add item to cart
exports.addItemToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;
    try {
        await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?', 
            [req.user.id, productId, quantity || 1, quantity || 1]
        );
        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [req.user.id]);
        res.status(200).json({ success: true, message: 'Cart updated', data: { cartCount: countResult[0].count } });
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        next(err);
    }
};

// @desc    Sync cart items (mass upload/replace)
exports.syncCartItems = async (req, res, next) => {
    const { cart } = req.body;
    if(!Array.isArray(cart)) return res.status(400).json({ success: false, message: 'Invalid cart format' });
    
    try {
        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        
        if (cart.length > 0) {
            const insertValues = cart.map(item => [req.user.id, item.id, item.quantity]);
            await pool.query('INSERT IGNORE INTO cart (user_id, product_id, quantity) VALUES ?', [insertValues]);
        }
        res.status(200).json({ success: true, message: 'Cart synced successfully' });
    } catch(err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        next(err);
    }
};

// @desc    Remove a specific item from cart
exports.removeItemFromCart = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [req.user.id]);
        res.status(200).json({ success: true, message: 'Item removed from cart', data: { cartCount: countResult[0].count } });
    } catch (err) {
        next(err);
    }
};

// @desc    Update cart item quantity
exports.updateCartItemQty = async (req, res, next) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be >= 1' });
    }
    try {
        await pool.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, req.user.id, req.params.productId]);
        res.status(200).json({ success: true, message: 'Cart updated' });
    } catch (err) {
        next(err);
    }
};
