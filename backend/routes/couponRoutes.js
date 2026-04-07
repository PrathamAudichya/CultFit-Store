const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const pool = require('../config/db');

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const [coupons] = await pool.query('SELECT code, discount_type, value, usage_limit FROM coupons WHERE expiry_date >= NOW()');
        res.json(coupons);
    } catch (error) {
        console.error('GET /coupons error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching coupons' });
    }
});

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
router.post('/validate', protect, async (req, res) => {
    const { code, cartTotal } = req.body;
    
    if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    // Cast cartTotal to number to handle string edge cases
    const numericCartTotal = parseFloat(cartTotal) || 0;

    try {
        const [coupons] = await pool.query('SELECT * FROM coupons WHERE code = ?', [code]);
        if (coupons.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
        }

        const coupon = coupons[0];

        // Check Expiry Date
        const today = new Date();
        const expiryDate = new Date(coupon.expiry_date);
        if (expiryDate < today) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        // Check Usage Limit (simplistic check)
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

        console.log(`[Coupon] Validated: ${code} | type=${coupon.discount_type} | value=${coupon.value} | discount=₹${discount_amount.toFixed(2)}`);

        res.json({
            success: true,
            discount: parseFloat(discount_amount.toFixed(2)),
            message: 'Coupon applied',
            id: coupon.id,
            code: coupon.code,
            discount_type: coupon.discount_type
        });
    } catch (error) {
        console.error('POST /coupons/validate error:', error);
        res.status(500).json({ success: false, message: 'Server error validating coupon' });
    }
});

module.exports = router;
