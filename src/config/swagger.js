const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cooks Kingdom',
      version: '0.1.0',
      description: `Cooks Kingdom is a platform that connects busy individuals, like students, with local cooks offering
        homemade food, providing convenient and delicious meal options. The website features an
        easy-to-use interface, allowing customers to browse dishes, place orders, and support local
        cookers, while chefs can manage their offerings through an admin dashboard.
        Check out our [GitHub repository](https://github.com/HishamWattar/cooks-kingdom), our [system architecture](https://github.com/HishamWattar/cooks-kingdom), and our [database design](https://github.com/HishamWattar/cooks-kingdom)`,
      contact: {
        email: 'cooks.supp@gmail.com',
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    externalDocs: {
      description: 'Find out more',
      url: 'http://swagger.io',
    },
    servers: [
      {
        url: process.env.PRODUCTION
          ? 'https://cookskingdom.onrender.com'
          : 'http://localhost:3000/',
      },
    ],
  },
  apis: ['./src/docs/**/*.yaml'],
};

module.exports = swaggerJSDoc(options);
