const axios = require('axios');
const fs = require('fs');
const fsPromise = require('fs/promises');
const { promises: Fs } = require('fs');
const Path = require('path');
require('dotenv').config();

const token = process.env.ACCESS_TOKEN;
const store_name = process.env.STORE_NAME;
const version = process.env.SHOPIFY_VERSION;

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

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

const genarateMutationQuery = async () => {
  const query = `mutation {
        bulkOperationRunQuery(
            query: """
            {
                products {
                    edges {
                        node {
                            id
                            metafields {
                                edges {
                                    node {
                                        id
                                        value
                                        namespace
                                        key
                                        type
                                    }
                                }
                            }
                        }
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
  const query = `query {
        node(id: "${id}") {
             ... on BulkOperation {
                url
                 partialDataUrl
                }
             }
        } `;
  const { data } = await restCall(query);
  return data.data.node.url;
};

async function exists(path) {
  try {
    await Fs.access(path);
    return true;
  } catch {
    return false;
  }
}

const getJsonlData = async (url) => {
  //const path = './files/export.jsonl';
  const path = Path.join(__dirname, 'files/export.jsonl');
  const result = await exists(path);
  if (result) {
    fs.unlinkSync(path);
  }
  const { data } = await axios.get(url);
  await fsPromise.writeFile(path, data);
};

const exportmetafield = async (req, res) => {
  const id = await genarateMutationQuery();
  await delay(240000);
  const url = await genarateURL(id);
  await delay(30000);
  const path = await getJsonlData(url);
  return res.status(200).json({ status: 'ok' });
};

module.exports = exportmetafield;
