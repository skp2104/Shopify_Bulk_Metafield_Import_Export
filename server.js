const express = require('express');
const productsRoutes = require('./routes/products');
require('dotenv').config();
const cors = require('cors');

const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/shopify/products', productsRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
