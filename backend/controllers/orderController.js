const pool = require('../config/db');

// @desc    Create new order
exports.createOrder = async (req, res, next) => {
    const { delivery_name, phone, delivery_address, pin_code, payment_method, upi_id, coupon_id, card_number } = req.body;

    // Validate Payment method
    const validMethods = ['COD', 'UPI', 'CARD'];
    if(!validMethods.includes(payment_method)) {
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    // Step 3: Implement Dummy Payment Logic
    // DB ENUM: 'Pending','Success','Failed','Refunded'
    let finalPaymentStatus = 'Pending';
    if (payment_method === 'CARD') {
        if (card_number === '1111') {
            return res.status(400).json({ success: false, message: 'Payment Failed: Transaction Declined' });
        }
        finalPaymentStatus = 'Success';
    } else if (payment_method === 'UPI') {
        finalPaymentStatus = 'Success'; // Assuming UPI is dummy success too
    } else if (payment_method === 'COD') {
        finalPaymentStatus = 'Pending';
    }

    const dbPaymentMethod = payment_method === 'CARD' ? 'Credit Card' : payment_method;
    const finalUpi = payment_method === 'UPI' ? upi_id : null;

    let connection;
    try {
        connection = await pool.getConnection(); // Use transaction to safely write multi-table
        await connection.beginTransaction();

        // 1. Get cart items from DB
        const [cartItems] = await connection.query(`
            SELECT c.quantity, p.id as product_id, p.price, p.discount_price, p.tax_percentage, p.stock,
                   p.title, pi.image_url
            FROM cart c JOIN products p ON c.product_id = p.id 
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
            WHERE c.user_id = ? FOR UPDATE
        `, [req.user.id]);

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'No items in cart' });
        }

        // 1b. Validate stock availability
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: `Insufficient stock for product ID ${item.product_id}. Available: ${item.stock}, Requested: ${item.quantity}` });
            }
        }

        // 2. Insert into addresses table
        const [addrResult] = await connection.query(
            'INSERT INTO addresses (user_id, recipient_name, phone, address_line1, city, state, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, delivery_name, phone || '0000000000', delivery_address, 'City', 'State', pin_code]
        );
        const addressId = addrResult.insertId;

        // 3. Compute totals
        let subtotal = 0;
        let totalTax = 0;
        let orderItemsValues = [];

        cartItems.forEach(item => {
            const activePrice = parseFloat(item.discount_price || item.price);
            const itemTotal = activePrice * item.quantity;
            const itemTax = itemTotal * (parseFloat(item.tax_percentage) / 100);

            subtotal += itemTotal;
            totalTax += itemTax;

            orderItemsValues.push([
                null, // reserved for orderId
                item.product_id,
                item.quantity,
                activePrice,
                item.title,
                item.image_url,
                item.tax_percentage,
                itemTax
            ]);
        });

        let discount_amount = 0;
        let final_coupon_id = null;

        // 4. Validate and Apply Coupon Server-Side
        if (coupon_id) {
            const [coupons] = await connection.query('SELECT * FROM coupons WHERE id = ?', [coupon_id]);
            if (coupons.length > 0) {
                const coupon = coupons[0];
                const today = new Date();
                const expiryDate = new Date(coupon.expiry_date);
                
                // Only apply if not expired and within usage limit
                if (expiryDate >= today && (coupon.usage_limit === null || coupon.usage_limit > 0)) {
                    final_coupon_id = coupon.id;
                    if (coupon.discount_type === 'percentage') {
                        discount_amount = (subtotal * coupon.value) / 100;
                    } else if (coupon.discount_type === 'flat') {
                        discount_amount = coupon.value;
                    } else if (coupon.discount_type === 'freeship') {
                        discount_amount = 100; // standard mock shipping cost
                    }
                    
                    // Consume one usage
                    const [couponUpdate] = await connection.query('UPDATE coupons SET usage_limit = usage_limit - 1 WHERE id = ? AND usage_limit > 0', [final_coupon_id]);
                    if (couponUpdate.affectedRows === 0) {
                        await connection.rollback();
                        return res.status(400).json({ success: false, message: 'Coupon usage limit reached during processing' });
                    }
                }
            }
        }

        const grandTotal = subtotal + totalTax - discount_amount;

        const orderStatus = (payment_method === 'COD' || finalPaymentStatus === 'Success') ? 'Processing' : 'Pending';

        // 5. Create Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, address_id, coupon_id, subtotal, tax_amount, discount_amount, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [req.user.id, addressId, final_coupon_id, subtotal, totalTax, discount_amount, grandTotal >= 0 ? grandTotal : 0, orderStatus]
        );
        const orderId = orderResult.insertId;

        // Add initial tracking
        await connection.query('INSERT INTO order_tracking (order_id, status, description) VALUES (?, "Placed", "Order has been placed.")', [orderId]);
        if (orderStatus === 'Processing') {
            await connection.query('INSERT INTO order_tracking (order_id, status, description) VALUES (?, "Processing", "Order is being processed.")', [orderId]);
        }

        // 5. Create Order Items
        orderItemsValues.forEach(arr => arr[0] = orderId);
        await connection.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_title, product_image, tax_percentage, tax_amount) VALUES ?', [orderItemsValues]);

        // 6. Decrement stock for ordered products
        for (const item of cartItems) {
            const [updateResult] = await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [item.quantity, item.product_id, item.quantity]
            );
            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: `Concurrency error: Insufficient stock for ${item.title}` });
            }
        }

        // 7. Create Payments row
        await connection.query(
            'INSERT INTO payments (order_id, payment_method, upi_id, amount, status) VALUES (?, ?, ?, ?, ?)',
            [orderId, dbPaymentMethod, finalUpi, grandTotal >= 0 ? grandTotal : 0, finalPaymentStatus]
        );

        // 7. Clear Cart
        await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        await connection.commit();
        res.status(201).json({ success: true, message: 'Order placed successfully', data: { orderId } });
        
        // Background simulated delivery
        if (orderStatus === 'Processing') {
            setTimeout(async () => {
                try {
                    await pool.query('UPDATE orders SET status = "Shipped" WHERE id = ? AND status = "Processing"', [orderId]);
                    await pool.query('INSERT INTO order_tracking (order_id, status, description) VALUES (?, "Shipped", "Order has been shipped.")', [orderId]);
                    setTimeout(async () => {
                        try {
                            await pool.query('UPDATE orders SET status = "Delivered" WHERE id = ? AND status = "Shipped"', [orderId]);
                            await pool.query('INSERT INTO order_tracking (order_id, status, description) VALUES (?, "Delivered", "Order has been delivered.")', [orderId]);
                        } catch(e) {}
                    }, 10000); // 10 seconds to simulate delivery after shipped
                } catch(e) {}
            }, 5000); // 5 seconds to simulate shipped
        }
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

// @desc    Update order status (Mock Delivery Flow)
exports.updateOrderStatus = async (req, res, next) => {
    let connection;
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        
        // Whitelist valid status values
        const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Find order
        const [orderCheck] = await connection.query('SELECT user_id, status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
        if(orderCheck.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        const order = orderCheck[0];
        
        // Verify ownership
        if(order.user_id !== req.user.id) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Prevent invalid transitions
        if (order.status === 'Cancelled' || order.status === 'Delivered') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Cannot update a ${order.status} order` });
        }
        
        await connection.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);
        await connection.query('INSERT INTO order_tracking (order_id, status, description) VALUES (?, ?, ?)', [orderId, status, `Order status updated to ${status}.`]);
        
        await connection.commit();
        res.status(200).json({ success: true, message: 'Order Status Updated to ' + status });
    } catch(error) {
        if(connection) await connection.rollback();
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

// @desc    Get logged in user orders
exports.getUserOrders = async (req, res, next) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*,
                   pay.payment_method,
                   f.rating  AS feedback_rating,
                   f.comment AS feedback_comment
            FROM orders o
            LEFT JOIN payments     pay ON pay.order_id = o.id
            LEFT JOIN order_feedback f ON f.order_id  = o.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        for (let order of orders) {
            const [items] = await pool.query(`
                SELECT oi.quantity,
                       oi.unit_price AS price,
                       COALESCE(oi.product_title, p.title) AS title,
                       COALESCE(oi.product_image, pi.image_url) AS image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                LEFT JOIN product_images pi
                       ON pi.product_id = p.id AND pi.is_primary = TRUE
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.status(200).json({ success: true, message: 'Orders fetched', data: orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order details by ID
exports.getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        
        const [orders] = await pool.query(`
            SELECT o.*,
                   a.recipient_name, a.phone as address_phone, a.address_line1, a.city, a.state, a.pin_code,
                   pay.payment_method, pay.transaction_id, pay.status as payment_status
            FROM orders o
            JOIN addresses a ON o.address_id = a.id
            LEFT JOIN payments pay ON pay.order_id = o.id
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, req.user.id]);

        if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        
        const order = orders[0];

        const [items] = await pool.query(`
            SELECT oi.quantity, oi.unit_price as price, oi.tax_amount, oi.tax_percentage,
                   COALESCE(oi.product_title, p.title) as title,
                   COALESCE(oi.product_image, pi.image_url) as image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
            WHERE oi.order_id = ?
        `, [order.id]);

        order.items = items;
        res.status(200).json({ success: true, message: 'Order details fetched', data: order });
    } catch(error) {
        next(error);
    }
};

// @desc    Cancel an order
exports.cancelOrder = async (req, res, next) => {
    let connection;
    try {
        const orderId = req.params.id;
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [orderCheck] = await connection.query('SELECT user_id, status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
        
        if(orderCheck.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        const order = orderCheck[0];
        if(order.user_id !== req.user.id) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if(['Delivered', 'Cancelled'].includes(order.status)) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Cannot cancel an order that is already ' + order.status });
        }
        
        // Restore stock for all items in the cancelled order
        const [orderItems] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of orderItems) {
            await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.query('UPDATE orders SET status = "Cancelled", updated_at = NOW() WHERE id = ?', [orderId]);
        await connection.query('INSERT INTO order_tracking (order_id, status, description) VALUES (?, "Cancelled", "Order has been cancelled. Stock restored.")', [orderId]);

        await connection.commit();
        res.status(200).json({ success: true, message: 'Order Cancelled Successfully' });
    } catch(error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// @desc    Submit feedback
exports.submitFeedback = async (req, res, next) => {
    try {
        const { order_id, rating, comment } = req.body;
        
        if(!order_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'A valid rating (1-5) and order_id are required' });
        }

        const [orderCheck] = await pool.query('SELECT user_id, status FROM orders WHERE id = ?', [order_id]);
        if(orderCheck.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        
        const order = orderCheck[0];
        if(order.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
        if(order.status !== 'Delivered') return res.status(400).json({ success: false, message: 'Feedback is only allowed for delivered orders' });

        await pool.query(
            'INSERT INTO order_feedback (order_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [order_id, req.user.id, rating, comment]
        );

        res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
    } catch(error) {
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for this order' });
        }
        next(error);
    }
};

// @desc    Get order tracking status
exports.getOrderTracking = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const [orderCheck] = await pool.query('SELECT user_id, status FROM orders WHERE id = ?', [orderId]);
        
        if(orderCheck.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        if(orderCheck[0].user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
        
        const [tracking] = await pool.query('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY tracked_at ASC', [orderId]);
        res.status(200).json({
            success: true,
            message: 'Tracking info fetched',
            data: {
                current_status: orderCheck[0].status,
                history: tracking
            }
        });
    } catch(error) {
        next(error);
    }
};
