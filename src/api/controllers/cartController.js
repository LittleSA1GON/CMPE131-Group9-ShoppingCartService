// src/api/controllers/cartController.js

const cartService = require('../../services/cartService');
// Note: We are using a fixed userId 1 for now.
// In the future, when we add JWT middleware, we will change this to req.user.id.

async function addItem(req, res) {
  try {
    const userId = 1; // TODO: Get from JWT
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
    const userId = 1;
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
    const userId = 1;
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
    const userId = 1;

    const cart = await cartService.getCartForUser(userId);

    // Since the acceptance criteria says "list items", we could have returned just items as well
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const userId = 1;

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