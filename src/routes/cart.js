const express = require('express');
const cartControllers = require('../controllers/cart');
const { isAuthenticated, isCustomer } = require('../middlewares/auth');

const routes = express.Router();

routes.post('/', isAuthenticated, isCustomer, cartControllers.postCart);
routes.delete('/', isAuthenticated, isCustomer, cartControllers.deleteCart);
routes.post(
  '/CartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.postCartItemByDishId
);
routes.put(
  'CartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.putCartItemByDishId
);
routes.get(
  'CartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.getCartItemByDishId
);
routes.delete(
  'CartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.deleteCartItemByDishId
);

module.exports = routes;
