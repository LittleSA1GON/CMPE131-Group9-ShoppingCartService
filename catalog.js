const express = require('express');
const app = express();

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);

  if (id === 999) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({ productId: id, name: "Test Product" });
});

app.listen(4000, () =>
  console.log("Mock Product Catalog running on port 4000")
);