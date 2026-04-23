const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');
const { optionalAuth } = require('../middlewares/authMiddleware');

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);

module.exports = router;
