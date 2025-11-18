Group 9 – Shopping Cart Service (UniCart)

Overview

This service manages a user’s shopping cart:
add items, update quantities, remove items, view the cart, and clear the cart.

Tech stack: Node.js, Express, SQLite
Architecture: Layered (controller → service → repository → database)


Project Structure

src/
  app.js
  server.js

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
    (reserved for JWT / error handling)

Group9-ShoppingCartService.yaml
docs/
  ShoppingCartStatus.md



Getting Started

npm install
npm start

The service runs on:
http://localhost:3000

Health check:

curl http://localhost:3000/
# => {"message":"Shopping Cart Service OK"}


⸻

API Endpoints (Shopping Cart Only)

Base path for this service:
	•	http://localhost:3000/api

Endpoints:
	•	GET    /api/cart
Get the current cart for the (temporary) user.
	•	POST   /api/cart/items
Add an item to the cart.
Body:

{
  "productId": 10,
  "quantity": 2
  }


	•	PUT    /api/cart/items/{productId}
Update the quantity of an item in the cart.
If the new quantity is 0 or negative, the item is removed.
	•	DELETE /api/cart/items/{productId}
Remove a single item from the cart.
	•	DELETE /api/cart
Clear the entire cart (remove all items).

Example – Add item to cart

curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": 10, "quantity": 2}'


⸻

OpenAPI Contract

The OpenAPI 3.0 contract for this service is defined in:
	•	Group9-ShoppingCartService.yaml

You can import this file into tools like Swagger UI, Postman, or Insomnia
to explore and test the API.

⸻

Internal Documentation / Status

A detailed description of the current implementation and architecture is available in:
	•	docs/ShoppingCartStatus.md