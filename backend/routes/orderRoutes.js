const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');
const validate = require('../middlewares/validate');
const { createOrderSchema } = require('../validators/orderValidator');

router.post('/', protect, validate(createOrderSchema), orderController.createOrder);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.get('/', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);
router.delete('/:id', protect, orderController.cancelOrder);
router.post('/feedback', protect, orderController.submitFeedback);
router.get('/:id/tracking', protect, orderController.getOrderTracking);

module.exports = router;
