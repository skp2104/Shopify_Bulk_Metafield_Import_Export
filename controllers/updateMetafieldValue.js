const axios = require('axios');
const fs = require('fs');
const readline = require('node:readline');
const { Updatelogger } = require('../helpers/updateLogger');
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

const updateMetafieldValue = async () => {
  try {
    const file = 'controllers/files/export.jsonl';
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    // console.log(rl);
    for await (const line of rl) {
      const data = JSON.parse(line);
      // console.log(data.key);
      if (
        (data.value != null && data.key == 'ebay_description') ||
        (data.value != null && data.key == 'ebay_price')
      ) {
        try {
          console.log(`key: ${data.key}; value: ${data.value}`);
          const query = `mutation {
            productUpdate(
            input : {
              id: "${data.__parentId}",
              metafields: [
            {
                  id: "${data.id}",
                  value: "Success"
            }
        ]
    }) {
              product {
                id
                metafields(first: 250) {
                  edges {
                    node {
                      id
                      namespace
                      key
                      value
                    }
                }
            }
        }
    }
}`;

          const query_res = await restCall(query);
          const x = query_res.data.data.productUpdate.product.metafields.edges;
          console.log(
            `key: ${x[x.length - 1].node.key}; value: ${
              x[x.length - 1].node.value
            }`
          );
          console.log(
            `key: ${x[x.length - 2].node.key}; value: ${
              x[x.length - 2].node.value
            }`
          );
          Updatelogger.log({
            level: 'info',
            message: `Successs, Product Id: ${
              query_res.data.data.productUpdate.product.id
            }, Metafield1_id: ${x[x.length - 1].node.id}, key:${
              x[x.length - 1].node.key
            }, value: ${x[x.length - 1].node.value}; Metafield2_id: ${
              x[x.length - 2].node.id
            }, key:${x[x.length - 2].node.key}, value: ${
              x[x.length - 2].node.value
            };`,
          });
        } catch (error) {
          console.log(error);
          Updatelogger.log({
            level: 'info',
            message: `Failure, with error: ${error}, Product Id: "${
              query_res.data.data.productUpdate.product.id
            }", "Metafield1_id": "${
              x[x.length - 1].node.id
            }", "Metafield2_id": "${x[x.length - 2].node.id}"`,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = updateMetafieldValue;
