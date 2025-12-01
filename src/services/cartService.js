// src/services/cartService.js

// Importing the repository layer


const cartRepo = require('../repositories/cartRepository');
const { verifyProductExists } = require('./ProductCatalogClient');

/**
 * Helper for internal use:
 * Finds the cart belonging to the user, creates a new one if it doesn't exist.
 */
async function getOrCreateCartForUser(userId) {
  let cart = await cartRepo.findCartByUserId(userId);

  if (!cart) {
    cart = await cartRepo.createCartForUser(userId);
  }

  return cart;
}

/**
 * C-01.1: Adding item to cart
 * - Creates cart if it doesn't exist
 * - Increases quantity if item is already in cart
 * - Returns the latest updated cart
 */
async function addItemToCart(userId, productId, quantity) {
  // Converting to number for security
  const pid = Number(productId);
  const qty = Number(quantity);

  if (!pid || !qty || qty <= 0) {
    const error = new Error('Invalid productId or quantity');
    error.status = 400;
    throw error;
  }

  await verifyProductExists(pid);

  const cart = await getOrCreateCartForUser(userId);

  const existingItem = await cartRepo.findItem(cart.cart_id, pid);

  if (existingItem) {
    const newQty = existingItem.quantity + qty;
    await cartRepo.updateItemQuantity(existingItem.cart_item_id, newQty);
  } else {
    await cartRepo.insertItem(cart.cart_id, pid, qty);
  }

  const items = await cartRepo.getItemsForCart(cart.cart_id);

  return {
    cartId: cart.cart_id,
    items
  };
}

/**
 * C-01.2: Updating item quantity in cart
 * - 404 if item doesn't exist
 * - Deletes item from cart if new quantity <= 0
 * - Otherwise sets quantity to the new value
 * - Returns the updated cart
 */
async function updateItemQuantityInCart(userId, productId, newQuantity) {
  const pid = Number(productId);
  const qty = Number(newQuantity);

  if (!pid || isNaN(qty)) {
    const error = new Error('Invalid productId or quantity');
    error.status = 400;
    throw error;
  }

  const cart = await cartRepo.findCartByUserId(userId);
  if (!cart) {
    const error = new Error('Cart not found');
    error.status = 404;
    throw error;
  }

  const existingItem = await cartRepo.findItem(cart.cart_id, pid);
  if (!existingItem) {
    const error = new Error('Item not found in cart');
    error.status = 404;
    throw error;
  }

  if (qty <= 0) {
    // Delete item if 0 or negative
    await cartRepo.deleteItem(cart.cart_id, pid);
  } else {
    await cartRepo.updateItemQuantity(existingItem.cart_item_id, qty);
  }

  const items = await cartRepo.getItemsForCart(cart.cart_id);

  return {
    cartId: cart.cart_id,
    items
  };
}

/**
 * C-01.3: Removing item from cart
 * - We try to delete whether the item exists or not, and return the remaining cart
 */
async function removeItemFromCart(userId, productId) {
  const pid = Number(productId);

  if (!pid) {
    const error = new Error('Invalid productId');
    error.status = 400;
    throw error;
  }

  const cart = await cartRepo.findCartByUserId(userId);
  if (!cart) {
    const error = new Error('Cart not found');
    error.status = 404;
    throw error;
  }

  await cartRepo.deleteItem(cart.cart_id, pid);

  const items = await cartRepo.getItemsForCart(cart.cart_id);

  return {
    cartId: cart.cart_id,
    items
  };
}

/**
 * C-02.1: Viewing the cart
 * - Returns empty array if no cart exists
 */
async function getCartForUser(userId) {
  const cart = await cartRepo.findCartByUserId(userId);

  if (!cart) {
    return {
      cartId: null,
      items: []
    };
  }

  const items = await cartRepo.getItemsForCart(cart.cart_id);

  return {
    cartId: cart.cart_id,
    items
  };
}

/**
 * C-02.2: Clearing the cart completely
 */
async function clearCartForUser(userId) {
  const cart = await cartRepo.findCartByUserId(userId);

  if (!cart) {
    // Silently finish if cart doesn't exist anyway
    return;
  }

  await cartRepo.deleteAllItemsForCart(cart.cart_id);
}

// Exporting the service functions
module.exports = {
  addItemToCart,
  updateItemQuantityInCart,
  removeItemFromCart,
  getCartForUser,
  clearCartForUser
};