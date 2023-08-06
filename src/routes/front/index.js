const express = require('express');
const homeController = require('../../controllers/front/home');

const routes = express.Router();

routes.get('/', homeController.getAllDishes);
routes.get('/login', homeController.login);
routes.get('/signup', homeController.signup);

module.exports = routes;
