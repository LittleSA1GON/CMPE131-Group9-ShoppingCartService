// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// In production, set this from the environment:
//   export JWT_SECRET="some-long-random-string"
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Validates a JWT from the Authorization header.
 *
 * - Looks for: Authorization: Bearer <token>
 * - Verifies the token using JWT_SECRET
 * - Extracts user id from the payload (userId / user_id / sub)
 * - On success: attaches req.user = { id: <userId> } and calls next()
 * - On failure: returns 401 Unauthorized
 */
function authMiddleware(req, res, next) {
  // Header can be 'authorization' or 'Authorization'
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Try a few common claim names for the user id:
    const userId = decoded.userId || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ message: 'Token does not contain user id' });
    }

    // Attach user info to the request object
    req.user = { id: userId };

    return next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;