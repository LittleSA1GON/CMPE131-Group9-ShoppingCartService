// src/server.js

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Shopping Cart Service is running on port ${PORT}`);
});