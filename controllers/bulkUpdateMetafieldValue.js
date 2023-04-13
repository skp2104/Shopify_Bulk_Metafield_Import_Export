const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
// const path = './data.jsonl';
const filePath = './controllers/files/import.jsonl';
const urlApi = 'https://shopify-staged-uploads.storage.googleapis.com/';
const fsPromise = require('fs/promises');
const readline = require('node:readline');

const token = process.env.ACCESS_TOKEN;
const store_name = process.env.STORE_NAME;
const version = process.env.SHOPIFY_VERSION;

var step3key;
var key5;
var str = '';

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
//   //const path = './files/export.jsonl';
//   try {
//     const file = 'controllers/files/export.jsonl';
//     const fileStream = fs.createReadStream(file);
//     const rl = readline.createInterface({
//       input: fileStream,
//       crlfDelay: Infinity,
//     });
//     // console.log(rl);
//     for await (const line of rl) {
//       const data = JSON.parse(line);
//       // console.log(data);
//       if (
//         (data.value != null && data.key == 'ebay_description') ||
//         (data.value != null && data.key == 'ebay_price')
//       ) {
//         console.log('try block');
//         newdata = {
//           input: {
//             metafields: [{ id: `${data.id}`, value: 'x' }],
//             id: `${data.__parentId}`,
//           },
//         };
//         console.log(newdata);
//         if (data.value != undefined) {
//           str += JSON.stringify(newdata);
//           str += '\n';
//         }
//         console.log(str);
//         fs.writeFile('controllers/files/users.jsonl', str, (err) => {
//           if (err) throw err;
//           //   console.log('Done writing');
//         });
//       }
//       // console.log(str); './users.jsonl'
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const apiCall = async (query_data) => {
  const url = `https://${store_name}/admin/api/${version}/graphql.json`;
  const headers = {
    'Content-Type': 'application/graphql',
    'X-Shopify-Access-Token': token,
  };
  return axios.post(url, query_data, { headers });
};

const importquery = async () => {
  let data = new FormData();
  const query = `mutation {
        stagedUploadsCreate(input:{
          resource: BULK_MUTATION_VARIABLES,
          filename: "metafieldUpdate",
          mimeType: "text/jsonl",
          httpMethod: POST
        }){
          userErrors{
            field,
            message
          },
          stagedTargets{
            url,
            resourceUrl,
            parameters {
              name,
              value
            }
          }
        }
      }`;
  const urlid = await apiCall(query);
  urlid.data.data.stagedUploadsCreate.stagedTargets[0].parameters.map(
    (item) => {
      data.append(item['name'], item['value']);
    }
  );

  step3key =
    urlid.data.data.stagedUploadsCreate.stagedTargets[0].parameters[3].value;

  data.append('file', fs.createReadStream(filePath));
  return data;
};

const uploadJSONL = (data) => {
  console.log('Check1');
  // console.log(data.getHeaders());
  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: urlApi,
    headers: {
      'Content-Type': 'application/graphql',
      'X-Shopify-Access-Token': token,
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  return 'no errror';
};

const importStep3 = async () => {
  const query = `mutation {
    bulkOperationRunMutation(
      mutation: "mutation updateProductMetafields($input: ProductInput!) {
    productUpdate(input: $input) {
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
      userErrors {
        message
        field
      }
    }
  }
  ",
      stagedUploadPath: "${step3key}") {
      bulkOperation {
        id
        url
        status
      }
      userErrors {
        message
        field
      }
    }
  }
  `;

  const urlid = await apiCall(query);
  key5 = urlid.data.data.bulkOperationRunMutation.bulkOperation.id;
};

const importStep4 = async () => {
  const query = `mutation {
    webhookSubscriptionCreate(
      topic: BULK_OPERATIONS_FINISH
      webhookSubscription: {
        format: JSON,
        callbackUrl: "https://123458.ngrok.io/"}
    ) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
      }
    }
  }`;

  const urlid = await apiCall(query);
};

const importStep5 = async () => {
  const query = `query {
    node(id: "${key5}") {
      ... on BulkOperation {
        url
        partialDataUrl
      }
    }
  }`;

  const urlid = await apiCall(query);
  return urlid.data.data.node.url;
};

const getAllData = async (url) => {
  const path = 'updatedMetafield.jsonl';
  const { data } = await axios.get(url);
  console.log(data);
  await fsPromise.writeFile(path, data);
};

const bulkUpdateMetafieldValue = async () => {
  // await readWriteJsonlData();
  const formData = await importquery();
  await uploadJSONL(formData);
  await delay(10000);
  await importStep3();
  await delay(10000);
  await importStep4();
  const url = await importStep5();
  await getAllData(url);
};

module.exports = bulkUpdateMetafieldValue;
// bulkUpdateMetafieldValue();
