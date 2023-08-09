const express = require('express');
const homeController = require('../../controllers/front/home');
const {
  isAuthenticated,
  isCustomer,
  isNotAuthenticated,
  hasNoRole,
} = require('../../middlewares/auth');

const routes = express.Router();

routes.get('/', homeController.getAllDishes);
routes.get('/cart', isAuthenticated, isCustomer, homeController.getCart);
routes.get('/profile', isAuthenticated, isCustomer, homeController.profile);
routes.get('/login', isNotAuthenticated, homeController.login);
routes.get('/signup', isNotAuthenticated, homeController.signup);
routes.put(
  '/item/:id',
  isAuthenticated,
  isCustomer,
  homeController.putCartItemByDishId
);
routes.get('/role', isAuthenticated, hasNoRole, homeController.role);
routes.get(
  '/addresses',
  isAuthenticated,
  isCustomer,
  homeController.getAddresses
);
routes.get(
  '/addresses/edit/:id',
  isAuthenticated,
  isCustomer,
  homeController.editAddress
);
module.exports = routes;
