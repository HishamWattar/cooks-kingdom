const express = require('express');

const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const globalErrorHandler = require('./middlewares/error');

const apiRoutes = require('./routes/index');

const { connectToMongo } = require('./db/connection');

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

app.use('/api', apiRoutes);

app.use(globalErrorHandler);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
    logger.info(`Server listening on port ${port}`);
    connectToMongo();
  });
}
module.exports = app;
