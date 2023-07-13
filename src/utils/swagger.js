const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cooks Kingdom',
      version: '0.1.0',
      description:
        'This is Cooks kingdom  API application made with Express and documented with Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Recoded Team 5',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = options;
