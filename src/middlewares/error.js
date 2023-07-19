// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const { statusCode, message } = error;
  res
    .status(statusCode || 500)
    .json({ message: message || 'Internal Server Error' });
};

module.exports = errorHandler;
