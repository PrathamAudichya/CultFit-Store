const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const couponController = require('../controllers/couponController');

router.get('/', protect, couponController.getActiveCoupons);
router.post('/validate', protect, couponController.validateCoupon);

module.exports = router;
