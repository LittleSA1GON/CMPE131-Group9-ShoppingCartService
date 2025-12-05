
# Group 9 – Shopping Cart Service (UniCart)

## 1. Overview

This repository implements **Service 2: Shopping Cart Service** from  
the class project described in *Handout 2: Individual Team Project Descriptions*.

**Core responsibility:**  
Manage temporary and persistent shopping carts for users, tracking the items a user
intends to buy across sessions and devices.

Main capabilities:

- Add a product and quantity to a user’s cart.
- Update the quantity of a product in the cart.
- Remove a product from the cart.
- View the contents of the cart.
- Clear the entire cart.
- Persist the cart in a SQLite database keyed by `user_id`.
- Require a valid JWT for all cart operations.
- Verify products via a Product Catalog Service.

---

## 2. Tech Stack

- Node.js + Express
- SQLite (file-based DB)
- JWT (JSON Web Tokens) for auth
- axios (HTTP client for Product Catalog calls)
- Jest + supertest (testing)

---

## 3. Project Structure

```text
.
├── README.md
├── Group9-ShoppingCartService.yaml      # OpenAPI spec for this service
├── catalog.js                           # Mock Product Catalog Service (local only)
├── package.json
├── package-lock.json
├── Dockerfile
├── .dockerignore
├── .gitignore
├── docs/
│   └── ShoppingCartStatus.md            # Internal status/architecture notes
├── src/
│   ├── app.js                           # Express app wiring
│   ├── server.js                        # Starts HTTP server
│   ├── api/
│   │   ├── controllers/
│   │   │   └── cartController.js        # HTTP controllers for cart endpoints
│   │   └── routes/
│   │       └── cartRoutes.js            # Routes for /api/cart...
│   ├── services/
│   │   ├── cartService.js               # Business logic for cart operations
│   │   └── ProductCatalogClient.js      # Client for Product Catalog Service
│   ├── repositories/
│   │   └── cartRepository.js            # All DB operations (SQL)
│   ├── database/
│   │   └── database.js                  # SQLite connection & table creation
│   └── middleware/
│       └── authMiddleware.js            # JWT auth, sets req.user.id
└── tests/
    └── app.test.js                      # Jest + supertest tests

Note: The SQLite DB file shopping-cart.db is created at runtime by
src/database/database.js and is not committed to version control.

⸻

4. Running the Service Locally

4.1 Install dependencies

npm install

4.2 Start the mock Product Catalog (optional but recommended)

In a separate terminal:

node catalog.js

This starts a simple Product Catalog mock on:
	•	http://localhost:4000

4.3 Start the Shopping Cart Service

In another terminal:

npm start

Expected console output:

Shopping Cart Service is running on port 3000
SQLite database initialized and tables are ready.

The service listens on:
	•	http://localhost:3000

⸻

5. JWT for Local Testing

All /api routes require a valid JWT.

For local testing, you can generate a token with the same secret used by the app:

node -e "console.log(require('jsonwebtoken').sign({ userId: 1 }, 'dev-secret-change-me'))"

Copy the printed token and use it in requests as:
	•	Header: Authorization: Bearer <TOKEN>

You can also paste this token into Postman’s Authorization → Bearer Token field.

⸻

6. Core API Endpoints (Shopping Cart)

All endpoints below require a valid JWT.

Method	Path	Description
GET	/api/cart	Get current user’s cart
POST	/api/cart/items	Add an item (product + quantity) to cart
PUT	/api/cart/items/{productId}	Update quantity of a product in the cart
DELETE	/api/cart/items/{productId}	Remove a specific product from the cart
DELETE	/api/cart	Clear the entire cart

Implementation:
	•	Routes: src/api/routes/cartRoutes.js
	•	Controllers: src/api/controllers/cartController.js
	•	Service: src/services/cartService.js
	•	Repository: src/repositories/cartRepository.js

⸻

7. Example Requests (curl)

Replace <TOKEN> with the JWT you generated.

7.1 Add an item to the cart

curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"productId": 10, "quantity": 2}'

7.2 View the cart

curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer <TOKEN>"

7.3 Update item quantity

curl -X PUT http://localhost:3000/api/cart/items/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"quantity": 5}'

7.4 Remove a single item

curl -X DELETE http://localhost:3000/api/cart/items/10 \
  -H "Authorization: Bearer <TOKEN>"

7.5 Clear the entire cart

curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer <TOKEN>"

These examples show that the APIs can be tested using curl or Postman, as required.

⸻

8. Automated Tests

Integration tests live in:
	•	tests/app.test.js

Run them with:

npm test

The test suite checks:
	•	Health check (GET /)
	•	Authentication behavior (no token, invalid token, valid token)
	•	Cart behavior:
	•	New user → empty cart
	•	Adding items (cart creation and quantity merge)
	•	Invalid quantity (0) → 400
	•	Updating quantity (including 0 → remove)
	•	Removing single items
	•	Clearing the cart and idempotent behavior of DELETE /api/cart
	•	ProductCatalogClient is mocked so tests do not depend on a real external service.
