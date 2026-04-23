const pool = require('../config/db');

// @desc    Get all active coupons
exports.getActiveCoupons = async (req, res, next) => {
    try {
        const [coupons] = await pool.query('SELECT code, discount_type, value, usage_limit FROM coupons WHERE expiry_date >= NOW()');
        res.status(200).json({ success: true, message: 'Coupons fetched', data: coupons });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate a coupon
exports.validateCoupon = async (req, res, next) => {
    const { code, cartTotal } = req.body;
    
    if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const numericCartTotal = parseFloat(cartTotal) || 0;

    try {
        const [coupons] = await pool.query('SELECT * FROM coupons WHERE code = ?', [code]);
        if (coupons.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
        }

        const coupon = coupons[0];

        const today = new Date();
        const expiryDate = new Date(coupon.expiry_date);
        if (expiryDate < today) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        if (coupon.usage_limit !== null && coupon.usage_limit <= 0) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        let discount_amount = 0;
        if (coupon.discount_type === 'percentage') {
            discount_amount = (numericCartTotal * parseFloat(coupon.value)) / 100;
        } else if (coupon.discount_type === 'flat') {
            discount_amount = parseFloat(coupon.value);
        } else if (coupon.discount_type === 'freeship') {
            discount_amount = 100; // Flat discount representing shipping fee
        }

        res.status(200).json({
            success: true,
            message: 'Coupon applied',
            data: {
                discount: parseFloat(discount_amount.toFixed(2)),
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type
            }
        });
    } catch (error) {
        next(error);
    }
};
