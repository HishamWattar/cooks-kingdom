const express = require('express');
const homeController = require('../../controllers/front/home');

const routes = express.Router();

routes.get('/', homeController.getAllDishes);
routes.get('/cart', homeController.getCart);
routes.get('/profile', homeController.profile);
routes.get('/login', homeController.login);
routes.get('/signup', homeController.signup);
routes.put('/item/:id', homeController.putCartItemByDishId);
routes.get('/role', homeController.role);
routes.get('/addresses', homeController.getAddresses);
routes.get('/addresses/edit/:id', homeController.editAddress);
module.exports = routes;
