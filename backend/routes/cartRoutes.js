const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cartController');
const validate = require('../middlewares/validate');
const { addToCartSchema, syncCartSchema, updateCartQtySchema } = require('../validators/cartValidator');

router.get('/', protect, cartController.getUserCart);
router.get('/summary', protect, cartController.getCartSummary);
router.post('/', protect, validate(addToCartSchema), cartController.addItemToCart);
router.post('/sync', protect, validate(syncCartSchema), cartController.syncCartItems);
router.delete('/:productId', protect, cartController.removeItemFromCart);
router.put('/:productId', protect, validate(updateCartQtySchema), cartController.updateCartItemQty);

module.exports = router;
