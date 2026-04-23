const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

router.get('/', protect, wishlistController.getWishlist);
router.post('/', protect, wishlistController.addToWishlist);
router.delete('/:productId', protect, wishlistController.removeFromWishlist);

module.exports = router;
