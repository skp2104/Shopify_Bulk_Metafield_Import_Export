# Custom-app

## Project Setup

custom-app uses npm for dependency management

```
# install dependencies
npm install
```

You will also need to set up a `.env` file in the root of the project. Copy and paste the following, and replace with your own credentials and theme ID:

```
PORT=5000
STORE_NAME=sbd-online-dev.myshopify.com
SHOPIFY_VERSION=2023-01
ACCESS_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Commands

A list of these tasks can be found in `package.json`.
`npm start`
⋅⋅⋅Run the server.js file

## Packages

"axios": "^1.3.5",
"cors": "^2.8.5",
"dotenv": "^16.0.3",
"express": "^4.18.2",
"fs": "0.0.1-security",
"winston": "^3.8.2"

## APIs

`http://localhost:3000/api/shopify/products/exportmetafield` - To Export all the metafields From Shopify Store
`http://localhost:3000/api/shopify/products/createmetafield` - To create 2 Metafield Definitions "eBay Price" and "eBay Description"
`http://localhost:3000/api/shopify/products/createmetafieldvalue` - To create blank values for the two metafields "eBay Price" and "eBay Description" for all products
`http://localhost:3000/api/shopify/products/updatemetafieldvalue` - To update some Dummy values to the metafields "eBay Price" and "eBay Description" for all products
