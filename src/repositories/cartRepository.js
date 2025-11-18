// src/repositories/cartRepository.js

// Import the database connection (our database.js returns a promise)
const dbPromise = require('../database/database');

/**
 * Finds the cart belonging to this user (returns a row if exists, otherwise null)
 */
async function findCartByUserId(userId) {
  const db = await dbPromise;

  const row = await db.get(
    'SELECT * FROM carts WHERE user_id = ?',
    [userId]
  );

  // Return null if cart doesn't exist, otherwise return the row
  return row || null;
}

/**
 * Creates a new cart for this user
 */
async function createCartForUser(userId) {
  const db = await dbPromise;

  const result = await db.run(
    'INSERT INTO carts (user_id) VALUES (?)',
    [userId]
  );

  // lastID = newly created cart_id
  return {
    cart_id: result.lastID,
    user_id: userId
  };
}

/**
 * Retrieves all items belonging to a specific cart
 */
async function getItemsForCart(cartId) {
  const db = await dbPromise;

  const rows = await db.all(
    'SELECT product_id, quantity FROM cart_items WHERE cart_id = ?',
    [cartId]
  );

  return rows; // [] or rows inside
}

/**
 * Searches for a specific product in a specific cart (returns row if exists, otherwise null)
 */
async function findItem(cartId, productId) {
  const db = await dbPromise;

  const row = await db.get(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );

  return row || null;
}

/**
 * Adds a new item to the cart
 */
async function insertItem(cartId, productId, quantity) {
  const db = await dbPromise;

  await db.run(
    'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
    [cartId, productId, quantity]
  );
}

/**
 * Updates the quantity of an item in the cart
 */
async function updateItemQuantity(cartItemId, newQuantity) {
  const db = await dbPromise;

  await db.run(
    'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
    [newQuantity, cartItemId]
  );
}

/**
 * Deletes a single item from the cart
 */
async function deleteItem(cartId, productId) {
  const db = await dbPromise;

  await db.run(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );
}

/**
 * Deletes all items in the cart (empties the cart)
 */
async function deleteAllItemsForCart(cartId) {
  const db = await dbPromise;

  await db.run(
    'DELETE FROM cart_items WHERE cart_id = ?',
    [cartId]
  );
}

// Exporting the functions
module.exports = {
  findCartByUserId,
  createCartForUser,
  getItemsForCart,
  findItem,
  insertItem,
  updateItemQuantity,
  deleteItem,
  deleteAllItemsForCart
};