// src/app.js

const express = require('express');
const dbPromise = require('./database/database'); // starts DB

const cartRoutes = require('./api/routes/cartRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());

// Protect all /api routes with JWT auth
app.use('/api', authMiddleware, cartRoutes);

// Basic health check on root
app.get('/', (req, res) => {
  res.json({ message: 'Shopping Cart Service OK' });
});

module.exports = app;
