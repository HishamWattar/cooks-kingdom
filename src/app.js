if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable global-require */
  require('dotenv').config();
  /* eslint-enable global-require */
}
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const express = require('express');
const bookRoutes = require('./routes/book');
const options = require('./utils/swagger');
const connectToMongo = require('./db/connection');

const app = express();
const port = process.env.NODE_LOCAL_PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', bookRoutes);

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectToMongo();
});

module.exports = app;
