const axios = require('axios');

// Base URL for the Product Catalog Service.
// Adjust this to match whatever the Product team / instructor has defined.
const PRODUCT_CATALOG_BASE_URL =
  process.env.PRODUCT_CATALOG_BASE_URL || 'http://localhost:4000';

/**
 * Verifies that a product exists in the Product Catalog.
 * - Throws { status: 400 } if productId is invalid.
 * - Throws { status: 404 } if the product does not exist in the catalog.
 * - Throws { status: 502 } (or 500) on other upstream errors.
 *
 * @param {number|string} productId
 * @returns {Promise<Object>} the product payload returned by the catalog (for future use)
 */
async function verifyProductExists(productId) {
  const id = Number(productId);

  if (!id) {
    const error = new Error('Invalid productId');
    error.status = 400;
    throw error;
  }

  try {
    // Example path; update if the real Product Catalog API is different.
    const url = `${PRODUCT_CATALOG_BASE_URL}/api/products/${id}`;
    const response = await axios.get(url);

    // Optionally check more fields, e.g. response.data.available
    return response.data;
  } catch (err) {
    // If the catalog returns 404, map that directly to a 404 from this service
    if (err.response && err.response.status === 404) {
      const error = new Error('Product not found in Product Catalog');
      error.status = 404;
      throw error;
    }

    console.error('Error verifying product with Product Catalog Service:', err.message);
    const error = new Error('Failed to verify product with Product Catalog Service');
    // You can choose 500 if you prefer, but 502 "Bad Gateway" fits upstream issues.
    error.status = 502;
    throw error;
  }
}

module.exports = {
  verifyProductExists
};