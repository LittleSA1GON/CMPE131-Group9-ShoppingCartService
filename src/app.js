// src/app.js

const express = require('express');
const dbPromise = require('./database/database'); // startd DB

const cartRoutes = require('./api/routes/cartRoutes'); // <-- yeni satır

const app = express();

app.use(express.json());

app.use('/api', cartRoutes);

// BasiC health check
app.get('/', (req, res) => {
  res.json({ message: 'Shopping Cart Service OK' });
});

module.exports = app;