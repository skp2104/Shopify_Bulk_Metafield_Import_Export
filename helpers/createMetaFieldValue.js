const winston = require('winston');

var filename =
  './logs/Create_MetaFieldValue_logger_file_' +
  new Date().toJSON().slice(0, 10) +
  '.log';
const createMetaFieldValue = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: filename }),
  ],
});

module.exports = {
  createMetaFieldValue,
};
