// src/api/controllers/cartController.js

const cartService = require('../../services/cartService');
// Note: userId now comes from JWT via authMiddleware.

async function addItem(req, res) {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await cartService.addItemToCart(userId, productId, quantity);

    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateItem(req, res) {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    const cart = await cartService.updateItemQuantityInCart(
      userId,
      productId,
      quantity
    );

    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function removeItem(req, res) {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const cart = await cartService.removeItemFromCart(userId, productId);

    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getCart(req, res) {
  try {
    const userId = req.user.id;

    const cart = await cartService.getCartForUser(userId);

    // You currently return the whole cart object: { cartId, items }
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const userId = req.user.id;

    await cartService.clearCartForUser(userId);

    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  addItem,
  updateItem,
  removeItem,
  getCart,
  clearCart
};
