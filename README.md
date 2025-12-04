Shopping Cart Service — CMPE 131 Group 9

A lightweight, test-driven Shopping Cart microservice built with Node.js, Express, and SQLite.
This service exposes RESTful endpoints for managing user-specific shopping carts, protected by JWT authentication.

Features

User-specific shopping carts

Add / update / remove cart items

Automatically creates a cart for a new user on first use

Clear all items in a cart (DELETE /api/cart)

SQLite persistence with auto-initialized tables

JWT authentication middleware

Jest + Supertest integration tests

Clean layering:

Controller → Service → Repository → Database

Tech Stack

Runtime: Node.js

Framework: Express

Database: SQLite

Testing: Jest, Supertest

Project Structure
src/
 ├── api/
 │    └── controllers/
 │         └── cartController.js      # Express route handlers for cart endpoints
 │
 ├── middleware/
 │    └── authMiddleware.js           # JWT verification middleware
 │
 ├── services/
 │    └── cartService.js              # Business logic for cart operations
 │
 ├── repositories/
 │    └── cartRepository.js           # Direct DB access methods (CRUD for carts & items)
 │
 ├── database/
 │    └── database.js                 # SQLite database initialization and setup
 │
 └── app.js                           # Express app wiring routes, middleware, and DB
tests/
 └── app.test.js                      # Integration tests for API and middleware

Getting Started
Prerequisites

Node.js (LTS recommended)

npm

SQLite (no manual setup needed; tables are created automatically)

Installation
git clone <your_repo_url>
cd CMPE131-Group9-ShoppingCartService
npm install

Running the Server
npm start


By default the server listens on port 3000 (check app.js or your config if changed).

Environment Variables

Create a .env file in the project root (if used in your setup) and define:

JWT_SECRET=your_secret_key_here
PORT=3000


Note: In tests, a convenience/testing token may be used that bypasses real-world auth flows, but the middleware still validates a token format.

API Overview

All protected endpoints expect an Authorization header with a bearer token:

Authorization: Bearer <token>

Health Check
GET /

Description: Simple health check endpoint.

Response:

{
  "message": "Shopping Cart Service is running"
}

Cart Endpoints

All /api/cart endpoints require a valid JWT.

GET /api/cart

Description: Retrieve the authenticated user’s cart.
If the user has no cart yet, returns an empty cart object or equivalent representation.

Response Example:

{
  "userId": "123",
  "items": [
    {
      "productId": "abc",
      "quantity": 2
    }
  ]
}

POST /api/cart/items

Description: Add an item to the cart.
If the cart doesn’t exist for the user, it is created automatically.
If the product already exists in the cart, its quantity is incremented.

Request Body:

{
  "productId": "abc",
  "quantity": 1
}


Responses:

200 OK – Item added/updated successfully, returns updated cart

400 Bad Request – Invalid productId or quantity (e.g., quantity <= 0)

PUT /api/cart/items/:productId

Description: Update the quantity of an existing cart item.

Request Body:

{
  "quantity": 3
}


Behavior:

If quantity > 0: updates the item quantity

If quantity === 0: removes the item from the cart

Responses:

200 OK – Cart updated

404 Not Found – Cart or item not found

DELETE /api/cart/items/:productId

Description: Remove a single item from the cart.

Responses:

200 OK – Item removed, returns updated cart

404 Not Found – Cart or item not found

DELETE /api/cart

Description: Remove all items from the authenticated user’s cart.

Responses:

204 No Content – Cart items cleared successfully (even if the cart had no items)

204 No Content – If the user has no cart at all (idempotent behavior)

Database

The service uses SQLite and auto-initializes the required tables on startup:

carts — Stores cart metadata (e.g., cart_id, user_id)

cart_items — Stores items belonging to a cart (e.g., cart_id, product_id, quantity)

Log output like:

SQLite database initialized and tables are ready.


indicates the database is ready.

Testing

The project includes integration tests for:

Health check

Authentication middleware behavior

Cart CRUD operations

Edge cases like invalid quantities and non-existent carts/items

Clearing all items from a cart

Run tests with:

npm test


You should see all tests passing, including:

DELETE /api/cart clears all items in the cart

DELETE /api/cart on user with no cart returns 204 and is idempotent

Development Notes

The business logic for clearing a cart calls the repository to delete all items for a given cart.

Ensure cartService.clearCartForUser uses the correct repository function:

await cartRepo.deleteAllItemsForCart(cart.cart_id);


This keeps the service behavior aligned with the tests and ensures DELETE /api/cart returns 204.

Contributors

CMPE 131 – Group 9
Eda Koker
Ethan Vu
Jonas Quiballo
Francisco Gil Skewes