const axios = require('axios');
const fs = require('fs');
const readline = require('node:readline');
const { createMetaFieldValue } = require('../helpers/createMetaFieldValue');
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

const createMetafieldValue = async () => {
  try {
    console.log('createMetafieldWithBlankValue function called');
    const file = 'controllers/files/export.jsonl';
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const data = JSON.parse(line);
      // console.log(data.id);
      if (data.__parentId == null) {
        // console.log(data.id);
        try {
          const query = `mutation {
              productUpdate(
              input : {
                id: "${data.id}",
                metafields: [
                  {
                    namespace: "Salsify",
                    key: "eBay_Price",
                    value: "_",
                    type: "single_line_text_field",
                  },
                  {
                    namespace: "Salsify",
                    key: "eBay_Description",
                    value: "_",
                    type: "multi_line_text_field",
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
            }
              `;

          const query_res = await restCall(query);
          const x = query_res.data.data.productUpdate.product.metafields.edges;
          createMetaFieldValue.log({
            level: 'info',
            message: `Successs, Product Id: "${
              query_res.data.data.productUpdate.product.id
            }", "Metafield1_id": "${x[x.length - 1].node.id}", "key":"${
              x[x.length - 1].node.key
            }", "value": "${x[x.length - 1].node.value}"; "Metafield2_id": "${
              x[x.length - 2].node.id
            }", "key":"${x[x.length - 2].node.key}", "value": "${
              x[x.length - 2].node.value
            }";`,
          });
        } catch (error) {
          console.log(error);
          createMetaFieldValue.log({
            level: 'info',
            message: `Failure, with error: ${error}, Product Id: "${query_res.data.data.productUpdate.product.id}"`,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = createMetafieldValue;
