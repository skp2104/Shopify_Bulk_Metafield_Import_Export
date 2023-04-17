const axios = require('axios');
const https = require('https');
const fs = require('fs');
const fsPromise = require('fs/promises');
const readline = require('node:readline');
const Excel = require('exceljs');
require('dotenv').config();
const { Exportlogger } = require('../helpers/logger');

const token = process.env.ACCESS_TOKEN;
const store_name = process.env.STORE_NAME;

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const restCall = async (data) => {
  try {
    const url = `https://reactconnection.myshopify.com/admin/api/2023-01/graphql.json`;
    const headers = {
      'X-Shopify-Access-Token': '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',
      'Content-Type': 'application/graphql',
      'Accept-Encoding': 'gzip,deflate,compress',
    };
    return axios.post(url, data, { headers });
    //return res;
  } catch (error) {
    console.log('error 2');
    // throw error;
  }
};

const genarateMutationQuery = async () => {
  const query = `mutation {
        bulkOperationRunQuery(
            query: """
            {
                orders {
                    pageInfo {
                        hasNextPage
                       }
                       edges {
                           node {
                           id
                           processedAt
                           transactions {
                             id
                             gateway
                           }
                         }
                       cursor
                   }
               }
            }
            """
            ) {
                bulkOperation {
                    id
                    status
                }userErrors {
                    field
                    message
                }
            }
         }`;
  const res = await restCall(query);
  return res.data.data.bulkOperationRunQuery.bulkOperation.id;
};

const genarateURL = async (id) => {
  //console.log(id)
  const query = `query {
        node(id: "${id}") {
             ... on BulkOperation {
                url
                 partialDataUrl
                }
             }
        } `;
  //console.log(query)
  const { data } = await restCall(query);
  return data.data.node.url;
};

const getAllData = async (url) => {
  const path = 'data.jsonl';
  const { data } = await axios.get(url);
  await fsPromise.writeFile(path, data);
  return path;
  // readFile(path);
};

const readFile = async (path) => {
  try {
    const fileStream = fs.createReadStream(path);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    for await (const line of rl) {
      try {
        const data = JSON.parse(line);
        const dataLenght = data.transactions.length;
        // console.log(data);

        console.log(data.transactions[0].gateway);
        if (data.transactions.length != 0) {
          const gatewayName = data.transactions[0].gateway;

          if (gatewayName === 'ebay') {
            // console.log(data.id);
            console.log('api call 1!');
            console.log(data.id);
            readFile2(data.id);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    throw error;
  }
};

const readFile2 = async (get_order_id) => {
  try {
    console.log('readFile2 function api call 2');

    const query = `mutation {
      orderUpdate(input: {
        metafields: [
          {
            namespace: "custom",
            key: "ebay Price 13",
            type: "single_line_text_field",
            value: "test"
          },
          {
            namespace: "custom",
            key: "ebay Description 13",
            type: "single_line_text_field",
            value: "test"
          },
        ],
        id: "${get_order_id}"
      }) {
        order {
          id
        }
        userErrors {
          message
          field
        }
      }
    }`;

    const query_res = await restCall(query);

    console.log('query_res');
    // console.log(query_res);
    // return query_res;
  } catch (error) {
    console.log('error');
  }
};

const execute = async () => {
  const id = await genarateMutationQuery();
  await delay(3000);
  const url = await genarateURL(id);
  const path = await getAllData(url);
  const get_order_id = await readFile(path);
  // const file = await readFile2(get_order_id);
  // console.log(get_order_id);
  //const data = await readFile(path)
};

// module.exports = {
//   execute,
// };

//execute().then(res => console.log(res));

execute();
