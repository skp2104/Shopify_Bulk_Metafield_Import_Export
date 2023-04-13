const axios = require('axios');
const { Createlogger } = require('../helpers/createLogger');
require('dotenv').config();

const token = process.env.ACCESS_TOKEN;
const store_name = process.env.STORE_NAME;
const version = process.env.SHOPIFY_VERSION;

const restCall = async (data) => {
  try {
    const url = `https://${store_name}/admin/api/${version}/graphql.json`;
    const headers = {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/graphql',
      'Accept-Encoding': 'gzip,deflate,compress',
    };
    return axios.post(url, data, { headers });
  } catch (error) {
    console.log(error);
  }
};

const arr = [
  {
    name: 'eBay Price',
    key: 'eBay_Price',
  },
  {
    name: 'eBay Description',
    key: 'eBay_Description',
  },
];

const createMetafieldDefinition = async () => {
  try {
    for (i = 0; i < arr.length; i++) {
      const query = `mutation {
          metafieldDefinitionCreate(definition: {
            name: "${arr[i].name}",
            namespace: "Salsify",
            key: "${arr[i].key}",
            type: "multi_line_text_field",
            ownerType: PRODUCT
          }) {
            createdDefinition {
              id
              name
              namespace
              key
              # add other return fields
            }
            userErrors {
              field
              message
              code
            }
          }
        }    
        `;
      const query_res = await restCall(query);
      Createlogger.log({
        level: 'info',
        message: `Success, with Metafield ID : ${query_res.data.data.metafieldDefinitionCreate.createdDefinition.id}`,
      });
    }
  } catch (error) {
    console.log(error);
    Createlogger.log({
      level: 'info',
      message: `Failure, with error: ${error}`,
    });
  }
};

module.exports = createMetafieldDefinition;
