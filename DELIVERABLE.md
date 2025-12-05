
# Deliverables – Shopping Cart Service (Group 9)

This document maps the required items from **Handout 2 – Individual Team Project Descriptions**
to concrete files in this repository for **Service 2: Shopping Cart Service**.

---

## 1. Project Overview & Responsibility

**Requirement**

- Describe the core responsibility of the Shopping Cart Service and its main features.

**Files**

- `README.md`
  - Sections **1. Overview** and **6. Core API Endpoints** describe:
    - Purpose of the service
    - Main cart operations
    - Relationship to the overall system.

---

## 2. Database Design & Implementation

**Requirement**

- Use a data model similar to the suggested `carts` and `cart_items` structure.
- Implement persistent storage so carts survive across sessions.

**Files**

- `src/database/database.js`
  - Opens/creates the SQLite database file `shopping-cart.db`.
  - Creates tables if they do not exist:

    - `carts`:
      - `cart_id` (INTEGER, PK, AUTOINCREMENT)
      - `user_id` (INTEGER)
      - `created_at` (TEXT, timestamp)
      - `added_at` (TEXT, timestamp)

    - `cart_items`:
      - `cart_item_id` (INTEGER, PK, AUTOINCREMENT)
      - `cart_id` (INTEGER, FK to carts)
      - `product_id` (INTEGER)
      - `quantity` (INTEGER)
      - `added_at` (TEXT, timestamp)

**Note**

- The `shopping-cart.db` file is generated at runtime and not committed;  
  schema and behavior are defined in `database.js`.

---

## 3. Core Shopping Cart API Endpoints

**Requirement**

Implement the following endpoints for the current user (using JWT):

- `GET    /api/cart`
- `POST   /api/cart/items`
- `PUT    /api/cart/items/{productId}`
- `DELETE /api/cart/items/{productId}`
- `DELETE /api/cart`

**Implementation Files**

- Routing:
  - `src/api/routes/cartRoutes.js`
- Controllers:
  - `src/api/controllers/cartController.js`
- Business logic:
  - `src/services/cartService.js`
- Database access:
  - `src/repositories/cartRepository.js`

**Notes**

- Controllers read `req.user.id` from the JWT, call the service layer, and return JSON responses.
- Service layer implements all core behaviors:
  - Creating a cart on first use
  - Adding items and merging quantities
  - Updating quantities (including `0` → remove)
  - Removing items
  - Clearing the cart for a user.

---

## 4. Authentication – Requires JWT

**Requirement**

- All Shopping Cart endpoints must require a valid JWT.

**Files**

- `src/middleware/authMiddleware.js`
  - Validates `Authorization: Bearer <token>` header.
  - Verifies the token using `JWT_SECRET`.
  - Extracts user id from the payload (`userId`, `user_id`, or `sub`) and sets `req.user.id`.
  - Returns `401 Unauthorized` on missing/invalid token.

- `src/app.js`
  - Applies the middleware to all API routes:

    ```js
    app.use('/api', authMiddleware, cartRoutes);
    ```

---

## 5. Inter-Service Communication – Product Catalog Service

**Requirement**

- The Shopping Cart Service must communicate with the Product Catalog Service
  to verify product existence (and price, conceptually).

**Files**

- `src/services/ProductCatalogClient.js`
  - Function: `verifyProductExists(productId)`
  - Calls:
    - `GET {PRODUCT_CATALOG_BASE_URL || http://localhost:4000}/api/products/{productId}`
  - Throws:
    - `400` for invalid `productId`
    - `404` if the product does not exist
    - `502` for upstream errors.

- `src/services/cartService.js`
  - Uses `verifyProductExists(productId)` inside `addItemToCart` before changing the cart.

- `catalog.js`
  - Mock Product Catalog Service for local testing.
  - Exposes `GET /api/products/:id` on port `4000`.

---

## 6. API Contract – OpenAPI Specification

**Requirement**

- Provide an API contract documenting the Shopping Cart Service endpoints.

**File**

- `Group9-ShoppingCartService.yaml`
  - OpenAPI 3.0 definition for:
    - `GET    /api/cart`
    - `DELETE /api/cart`
    - `POST   /api/cart/items`
    - `PUT    /api/cart/items/{productId}`
    - `DELETE /api/cart/items/{productId}`
  - Includes schemas:
    - `Cart`
    - `CartItem`
    - `Error`

---

## 7. Testing – Automated & curl/Postman

**Requirement**

- APIs must be testable (curl/Postman) and include automated tests where required.

**Automated Tests**

- `tests/app.test.js`
  - Uses Jest + supertest.
  - Resets tables between tests.
  - Mocks `ProductCatalogClient.verifyProductExists`.
  - Verifies:
    - `GET /` health check.
    - Authentication:
      - No token → `401`
      - Invalid token → `401`
      - Valid token → `GET /api/cart` works.
    - Cart behavior:
      - New user → empty cart.
      - Adding items (cart creation + quantity merge).
      - Invalid quantity (`0`) → `400`.
      - Updating quantity (including `0` → remove).
      - Deleting single items.
      - Clearing the cart and idempotent `DELETE /api/cart`.

**curl/Postman Testing**

- `README.md`:
  - Section **9. Running the Service Locally**
  - Section **10. JWT for Local Testing**
  - Section **11. Example Requests (curl)**

These sections show:

- How to start the service.
- How to generate a test JWT.
- Exact `curl` commands for all core endpoints  
  (directly reusable in Postman by copying URL, method, headers, and body).

---

## 8. Optional: Docker / Containerization

*(Not required by Handout 2, but implemented.)*

**Files**

- `Dockerfile`
  - Builds a Node.js image and starts the app with `npm start` on port `3000`.

- `.dockerignore`
  - Excludes development artifacts such as:
    - `node_modules/`
    - `.git`
    - `Dockerfile`
    - `shopping-cart.db`

