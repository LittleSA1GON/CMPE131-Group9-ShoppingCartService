// src/database/database.js

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Database file name (shopping-cart.db will be created in the same folder)
const DBSOURCE = 'shopping-cart.db';

async function setupDatabase() {
  // 1) Open the database (creates it if it doesn't exist)
  const db = await open({
    filename: DBSOURCE,
    driver: sqlite3.Database
  });

  // 2) carts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS carts (
      cart_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3) cart_items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id      INTEGER NOT NULL,
      product_id   INTEGER NOT NULL,
      quantity     INTEGER NOT NULL,
      added_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
    );
  `);

  console.log('SQLite database initialized and tables are ready.');

  return db;
}

// Anyone requiring this file will get the db when it is ready
module.exports = setupDatabase();