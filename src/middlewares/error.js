const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const { statusCode, message } = error;
  logger.error(message);
  res
    .status(statusCode || 500)
    .json({ message: message || 'Internal Server Error' });
};

module.exports = errorHandler;
