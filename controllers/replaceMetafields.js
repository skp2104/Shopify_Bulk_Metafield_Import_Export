const axios = require('axios');
const fs = require('fs');
const fsPromise = require('fs/promises');
const readline = require('node:readline');
const Excel = require('exceljs');
//require('dotenv').config();
const { Exportlogger } = require('../helpers/logger');

const token = process.env.ACCESS_TOKEN;
const store_name = process.env.STORE_NAME;

var arr = [];

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
    throw error;
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
  return { data, path };
};

// const fetchData = async (path) => {
//   try {
//     const fileStream = fs.createReadStream(path);
//     const rl = readline.createInterface({
//       input: fileStream,
//       crlfDelay: Infinity,
//     });
//     for await (const line of rl) {
//       const line_data = JSON.parse(line);

//       // if(line_data.key == 'Brand_Logo_Image'){
//       //     const data = line_data.value;
//       //     console.log(data);
//       //     const out = data.split(",");
//       //     out.forEach(element => {
//       //         let result = element.replace("http://", "https://");
//       //         console.log(result)
//       //     });
//       // }
//       // if(line_data.key == 'Beauty_Image'){
//       //     console.log(line_data.value)
//       // }
//       if (line_data.key == 'foo') {
//         console.log(line_data.value);
//       }
//       // if(line_data.key == 'Product_Media_Json'){
//       //     console.log(line_data.value)
//       // }
//     }
//   } catch (error) {
//     throw error;
//   }
// };

const readFile = async (path) => {
  // var arr = [];
  var newArr = [];
  try {
    const fileStream = fs.createReadStream(path);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const line_data = JSON.parse(line);
      if (line_data.type == 'json' && line_data.key == 'Product_Media_Json') {
        var mystring = line_data.value;
        // console.log(line_data.value, line_data.id, line_data.__parentId);
        var stringify = JSON.stringify(mystring);
        var find = 'http:';
        var regex = new RegExp(find, 'g');
        var string = stringify.replace(regex, 'https:');
        var object = JSON.parse(string);
        arr.push({
          __parentId: line_data.__parentId,
          id: line_data.id,
          value: object,
        });
      } else if (
        line_data.key == 'DAM_URL' ||
        line_data.key == 'Beauty_Image' ||
        line_data.key == 'Brand_Logo_Image'
      ) {
        var mystring = line_data.value;
        // console.log(line_data.value, line_data.id, line_data.__parentId);
        var find = 'http:';
        var regex = new RegExp(find, 'g');
        var string = mystring.replace(regex, 'https:');
        // console.log(string);

        arr.push({
          __parentId: line_data.__parentId,
          id: line_data.id,
          value: string,
        });
      }
    }
  } catch (error) {}
};

const updateRestCall = async () => {
  //   console.log(arr.length);
  //   console.log('Update Calling');
  console.log(arr.length);
  try {
    var i;
    for (i = 0; i < arr.length; i++) {
      console.log(i);
      data = `mutation {
          productUpdate(
          input : {
            id: "${arr[i].__parentId}",
            metafields: [
              {
                id: "${arr[i].id}",
                value: "${arr[i].value}"
              }
            ]
          }) {
            product {
              metafields(first: 1) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }`;
      const res = await restCall(data);
      Exportlogger.log({
        level: 'info',
        message: `Success, with Data : ${arr[i].id} ${arr[i].__parentId}
        } `,
      });
    }
  } catch (error) {
    Exportlogger.log({
      level: 'info',
      message: `Failure, with error: ${error}, Data : ${arr[i].id} ${arr[i].__parentId}
      } `,
    });
  }

  //   return res;
};

const execute = async () => {
  const id = await genarateMutationQuery();
  //   console.log(id);
  await delay(60000);
  const url = await genarateURL(id);
  //console.log(url)
  await delay(30000);
  const { path, data } = await getAllData(url);
  await fsPromise.writeFile(path, data);
  const read = await readFile(path);
  await delay(10000);
  // console.log(arr);
  const path1 = await updateRestCall();

  //console.log(path)

  //const getData = await fetchData(path)

  //console.log(getData)
  //const data = await readFile(path)
};

// module.exports = {
//   execute,
// };

//execute().then(res => console.log(res));
execute();
