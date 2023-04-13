const winston = require('winston');

var filename =
  './logs/Update_logger_file_' + new Date().toJSON().slice(0, 10) + '.log';
const Updatelogger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: filename }),
  ],
});

module.exports = {
  Updatelogger,
};
