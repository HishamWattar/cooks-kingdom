if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable global-require */
  require('dotenv').config();
  /* eslint-enable global-require */
}
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const swaggerSpec = require('./utils/swagger');
const connectToMongo = require('./db/connection');

const app = express();
const port = process.env.NODE_LOCAL_PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Server listening on port ${port}`);
  connectToMongo();
});

module.exports = app;
