# Shopping Cart Service – Current Status (Group 9)

## 1. Overview

- The backend for the **Shopping Cart Service** is fully up and running.
- We use a layered architecture: **controller → service → repository → database**.
- The following 5 core endpoints are implemented and working against a real SQLite database:
  - `GET    /api/cart`
  - `POST   /api/cart/items`
  - `PUT    /api/cart/items/{productId}`
  - `DELETE /api/cart/items/{productId}`
  - `DELETE /api/cart`
- An OpenAPI (Swagger) contract for this service is defined in `Group9-ShoppingCartService.yaml`.

---

## 2. Project Setup and Structure

### 2.1 Node.js project and dependencies

- Initialized a Node.js project:

  ```bash
  npm init -y

	•	Installed required dependencies:

npm install express sqlite sqlite3


	•	Added a start script to package.json:

"scripts": {
  "start": "node src/server.js"
}



2.2 Folder structure (under src/)

Current structure:

src/
  app.js           # Express application setup
  server.js        # Starts the HTTP server

  api/
    controllers/
      cartController.js
    routes/
      cartRoutes.js

  services/
    cartService.js

  repositories/
    cartRepository.js

  database/
    database.js

  middleware/
    (currently empty, reserved for JWT / error handling later)


⸻

3. Entry Points

3.1 src/app.js
	•	Creates the Express app.
	•	Enables JSON body parsing: app.use(express.json());
	•	Requires database.js so the SQLite database and tables are initialized on startup.
	•	Registers the Shopping Cart routes under /api:

const cartRoutes = require('./api/routes/cartRoutes');
app.use('/api', cartRoutes);


	•	Provides a simple health check:

app.get('/', (req, res) => {
  res.json({ message: 'Shopping Cart Service OK' });
});



3.2 src/server.js
	•	Imports the app from app.js.
	•	Starts the server on port 3000 (or process.env.PORT if defined):

app.listen(PORT, () => {
  console.log(`Shopping Cart Service is running on port ${PORT}`);
});



⸻

4. Database Layer – SQLite

4.1 src/database/database.js
	•	Uses sqlite3 and sqlite to open a SQLite database file named shopping-cart.db.
	•	On startup, it creates two tables if they do not exist:

carts (
  cart_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

cart_items (
  cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id      INTEGER NOT NULL,
  product_id   INTEGER NOT NULL,
  quantity     INTEGER NOT NULL,
  added_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
);

	•	Exports a promise that resolves to the database connection:

module.exports = setupDatabase();

The repository layer awaits this promise to run queries.

⸻

5. Repository Layer – cartRepository.js

File: src/repositories/cartRepository.js
Responsibility: Talk to the database using SQL only (no HTTP, no business logic).

Implemented functions:
	•	findCartByUserId(userId)
→ Returns the cart row for a given user from carts, or null if none.
	•	createCartForUser(userId)
→ Inserts a new row into carts and returns the new cart_id.
	•	getItemsForCart(cartId)
→ Returns all items (product_id, quantity) from cart_items for a given cart.
	•	findItem(cartId, productId)
→ Finds a specific product in a specific cart.
	•	insertItem(cartId, productId, quantity)
→ Inserts a new row into cart_items.
	•	updateItemQuantity(cartItemId, newQuantity)
→ Updates the quantity column for a specific cart_item_id.
	•	deleteItem(cartId, productId)
→ Deletes a single product from the cart.
	•	deleteAllItemsForCart(cartId)
→ Deletes all items for a given cart (clears the cart).

⸻

6. Service Layer – cartService.js

File: src/services/cartService.js
Responsibility: Business logic. Uses the repository, does not know about HTTP.

6.1 Helper
	•	getOrCreateCartForUser(userId)
→ Returns the existing cart for the user, or creates a new one if missing.

6.2 Main functions
	•	addItemToCart(userId, productId, quantity)
	•	Validates productId and quantity (quantity > 0 or rejects with status 400).
	•	Retrieves or creates the cart for the user.
	•	If the item already exists, increases its quantity.
	•	Otherwise, inserts a new item.
	•	Returns { cartId, items } with the updated cart.
	•	updateItemQuantityInCart(userId, productId, newQuantity)
	•	If the cart does not exist → throws 404 Cart not found.
	•	If the item is not in the cart → throws 404 Item not found in cart.
	•	If newQuantity <= 0 → deletes the item from the cart.
	•	Otherwise, updates the item’s quantity to the new value.
	•	Returns { cartId, items } with the updated cart.
	•	removeItemFromCart(userId, productId)
	•	If the cart does not exist → throws 404 Cart not found.
	•	Attempts to delete the item (if present).
	•	Returns { cartId, items } (possibly empty).
	•	getCartForUser(userId)
	•	If the user has no cart → returns { cartId: null, items: [] }.
	•	Otherwise returns { cartId, items }.
	•	clearCartForUser(userId)
	•	If there is no cart, exits quietly.
	•	If there is a cart, deletes all items for that cart.

⸻

7. Controllers and Routes

7.1 Controller – cartController.js

File: src/api/controllers/cartController.js
Responsibility: Handle HTTP requests, read req.body / req.params, call service, send response.

Functions:
	•	addItem(req, res)
	•	Uses userId = 1 (hard-coded for now; will be replaced by JWT in the future).
	•	Reads productId and quantity from the request body.
	•	Calls cartService.addItemToCart.
	•	On success, responds with 200 and the Cart JSON.
	•	On error, returns appropriate status (400/404/500) with an error message.
	•	updateItem(req, res)
	•	productId from req.params.productId, quantity from body.
	•	Calls cartService.updateItemQuantityInCart.
	•	On success, responds with 200 and the updated cart.
	•	removeItem(req, res)
	•	productId from req.params.productId.
	•	Calls cartService.removeItemFromCart.
	•	Responds with 200 and the updated cart.
	•	getCart(req, res)
	•	Calls cartService.getCartForUser.
	•	Responds with 200 and the cart JSON.
	•	clearCart(req, res)
	•	Calls cartService.clearCartForUser.
	•	Responds with 204 No Content.

7.2 Routes – cartRoutes.js

File: src/api/routes/cartRoutes.js
Responsibility: Map URLs to controller functions.

router.post('/cart/items',              cartController.addItem);
router.put('/cart/items/:productId',    cartController.updateItem);
router.delete('/cart/items/:productId', cartController.removeItem);
router.get('/cart',                     cartController.getCart);
router.delete('/cart',                  cartController.clearCart);

Because app.js uses:

app.use('/api', cartRoutes);

the final endpoints are:
	•	POST   /api/cart/items
	•	PUT    /api/cart/items/{productId}
	•	DELETE /api/cart/items/{productId}
	•	GET    /api/cart
	•	DELETE /api/cart

⸻

8. Manual Tests (curl)

After running npm start, we verified all 5 endpoints with curl:
	1.	Add item to cart

curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": 10, "quantity": 2}'

Response:

{"cartId":1,"items":[{"product_id":10,"quantity":2}]}


	2.	Get cart

curl http://localhost:3000/api/cart

{"cartId":1,"items":[{"product_id":10,"quantity":2}]}


	3.	Update quantity

curl -X PUT http://localhost:3000/api/cart/items/10 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'

{"cartId":1,"items":[{"product_id":10,"quantity":5}]}


	4.	Remove single item

curl -X DELETE http://localhost:3000/api/cart/items/10

{"cartId":1,"items":[]}


	5.	Clear entire cart
	•	Re-added an item with POST /api/cart/items, then:

curl -X DELETE http://localhost:3000/api/cart
curl http://localhost:3000/api/cart

Final response:

{"cartId":1,"items":[]}



These tests confirm that all 5 core endpoints behave as expected.

⸻

9. OpenAPI Contract – Group9-ShoppingCartService.yaml
	•	An OpenAPI 3.0 spec file was created in the project root:
	•	Group9-ShoppingCartService.yaml
	•	It defines:
	•	openapi: 3.0.0, info, and servers.
	•	Paths for all Shopping Cart endpoints:
	•	/api/cart (GET, DELETE)
	•	/api/cart/items (POST)
	•	/api/cart/items/{productId} (PUT, DELETE)
	•	Request body schemas:
	•	productId (integer)
	•	quantity (integer, minimum 1)
	•	Response schemas:
	•	Cart → { cartId, items: CartItem[] }
	•	CartItem → { product_id, quantity }
	•	Error → { message: string }

The YAML file is aligned with the current backend implementation and is sufficient as the API contract for the Shopping Cart Service in Lab09.

⸻

current status:
We now have a fully working, layered Node.js + Express + SQLite implementation of the Shopping Cart Service with 5 core endpoints and a matching OpenAPI 3.0 contract.

