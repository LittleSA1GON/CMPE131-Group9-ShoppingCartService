// src/api/routes/cartRoutes.js

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');

// The base path here will be /api (we will bind it in app.js)

// Add item to cart (C-01.1)
router.post('/cart/items', cartController.addItem);

// Update item quantity in cart (C-01.2)
router.put('/cart/items/:productId', cartController.updateItem);

// Remove item from cart (C-01.3)
router.delete('/cart/items/:productId', cartController.removeItem);

// View cart (C-02.1)
router.get('/cart', cartController.getCart);

// Clear cart completely (C-02.2)
router.delete('/cart', cartController.clearCart);

module.exports = router;