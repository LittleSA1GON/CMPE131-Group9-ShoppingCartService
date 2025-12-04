// tests/app.test.js

// Use a dedicated JWT secret for tests (must match authMiddleware)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// MOCK the Product Catalog client so tests don't depend on an external service
jest.mock('../src/services/ProductCatalogClient', () => ({
  verifyProductExists: jest.fn(async (productId) => ({
    id: productId,
    name: `Test Product ${productId}`
  }))
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const dbPromise = require('../src/database/database');
const { verifyProductExists } = require('../src/services/ProductCatalogClient');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper: create a JWT for a given userId
function makeToken(userId = 1) {
  return jwt.sign({ userId }, JWT_SECRET);
}

// Clean out DB before/after tests to keep them independent
async function resetDatabase() {
  const db = await dbPromise;
  // Tables are created by database.js; we just clear them
  await db.exec('DELETE FROM cart_items; DELETE FROM carts;');
}

beforeAll(async () => {
  await resetDatabase();
});

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  const db = await dbPromise;
  await db.close();
});

describe('Health check', () => {
  test('GET / returns service OK message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Shopping Cart Service OK' });
  });
});

describe('Authentication middleware', () => {
  test('GET /api/cart without token returns 401', async () => {
    const res = await request(app).get('/api/cart');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/cart with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/cart with valid token is allowed', async () => {
    const token = makeToken(1);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cartId');
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

describe('Cart API', () => {
  test('GET /api/cart returns empty cart for a new user', async () => {
    const token = makeToken(100);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    // According to docs: { cartId: null, items: [] } when no cart yet
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      cartId: null,
      items: []
    });
  });

  test('POST /api/cart/items creates a cart and adds an item', async () => {
    const token = makeToken(1);

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 101, quantity: 2 });

    expect(res.status).toBe(200);
    expect(verifyProductExists).toHaveBeenCalledWith(101);

    expect(typeof res.body.cartId === 'number' || res.body.cartId === null).toBe(
      true
    );
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product_id: 101,
      quantity: 2
    });
  });

  test('POST /api/cart/items increments quantity when same product is added again', async () => {
    const token = makeToken(2);

    // First add
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 200, quantity: 2 });

    // Second add (duplicate product)
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 200, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product_id: 200,
      quantity: 5 // 2 + 3
    });
  });

  test('POST /api/cart/items with invalid quantity (0) returns 400', async () => {
    const token = makeToken(3);

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 123, quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /api/cart/items/:productId updates quantity', async () => {
    const token = makeToken(4);

    // Add item first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 300, quantity: 1 });

    // Update quantity
    const res = await request(app)
      .put('/api/cart/items/300')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product_id: 300,
      quantity: 5
    });
  });

  test('PUT /api/cart/items/:productId with quantity 0 removes the item', async () => {
    const token = makeToken(5);

    // Add item first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 400, quantity: 2 });

    // Set quantity to 0 (should remove)
    const res = await request(app)
      .put('/api/cart/items/400')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items).toHaveLength(0);
  });

  test('PUT /api/cart/items/:productId on non-existing item returns 404', async () => {
    const token = makeToken(6);

    const res = await request(app)
      .put('/api/cart/items/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /api/cart/items/:productId removes a single item', async () => {
    const token = makeToken(7);

    // Add two items
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 500, quantity: 1 });

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 600, quantity: 2 });

    // Remove one of them
    const res = await request(app)
      .delete('/api/cart/items/500')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product_id: 600,
      quantity: 2
    });
  });

  test('DELETE /api/cart/items/:productId on non-existing cart returns 404', async () => {
    const token = makeToken(8);

    const res = await request(app)
      .delete('/api/cart/items/1234')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /api/cart clears all items in the cart', async () => {
    const token = makeToken(9);

    // Add a couple of items
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 700, quantity: 1 });

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 800, quantity: 3 });

    // Clear the cart
    const clearRes = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(clearRes.status).toBe(204); // No Content

    // Cart should now be empty for this user
    const getRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body.items)).toBe(true);
    expect(getRes.body.items).toHaveLength(0);
  });

  test('DELETE /api/cart on user with no cart returns 204 and is idempotent', async () => {
    const token = makeToken(10);

    const res1 = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    const res2 = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res1.status).toBe(204);
    expect(res2.status).toBe(204);
  });
});
