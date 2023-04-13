const fs = require('fs');
const readline = require('node:readline');
var str = '';
var newdata1 = '';
var newdata2 = '';
var newdata = '';

const readWriteJsonlData = async (url) => {
  //const path = './files/export.jsonl';
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
      // console.log(data);
      if (
        (data.value != null && data.key == 'ebay_price') ||
        (data.value != null && data.key == 'ebay_description')
      ) {
        if (data.value != null && data.key == 'ebay_price') {
          console.log('try block');
          newdata2 = { id: `${data.id}`, value: 'skp11' };
          console.log('check1');
        }

        if (data.value != null && data.key == 'ebay_description') {
          newdata1 = { id: `${data.id}`, value: 'skp22' };
          console.log('check2');
        }
      }

      if (
        (data.value != null &&
          newdata1 != '' &&
          newdata2 != '' &&
          data.key == 'ebay_price') ||
        (data.value != null &&
          newdata1 != '' &&
          newdata2 != '' &&
          data.key == 'ebay_description')
      ) {
        newdata = {
          input: {
            metafields: [newdata1, newdata2],
            id: `${data.__parentId}`,
          },
        };
        str += JSON.stringify(newdata);
        str += '\n';

        console.log(str);
        fs.writeFile('controllers/files/import.jsonl', str, (err) => {
          if (err) throw err;
          //   console.log('Done writing');
        });
        newdata1 = '';
        newdata2 = '';
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = readWriteJsonlData;
// readWriteJsonlData();
