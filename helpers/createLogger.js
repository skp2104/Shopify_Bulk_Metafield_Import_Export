const winston = require('winston');

var filename =
  './logs/Create_logger_file_' + new Date().toJSON().slice(0, 10) + '.log';
const Createlogger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: filename }),
  ],
});

module.exports = {
  Createlogger,
};
