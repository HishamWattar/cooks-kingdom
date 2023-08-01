const express = require('express');
const cartControllers = require('../controllers/cart');
const { isAuthenticated, isCustomer } = require('../middlewares/auth');
const {
  updateCartItem,
  validationHandler,
} = require('../middlewares/validation');

const routes = express.Router();

routes.get('/', isAuthenticated, isCustomer, cartControllers.getCart);
routes.post(
  '/',
  updateCartItem,
  isAuthenticated,
  isCustomer,
  cartControllers.postCart
);
routes.delete('/', isAuthenticated, isCustomer, cartControllers.deleteCart);
routes.post(
  '/item/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.postCartItemByDishId
);
routes.put(
  '/item/:id',
  updateCartItem,
  validationHandler,
  isAuthenticated,
  isCustomer,
  cartControllers.putCartItemByDishId
);
routes.get(
  '/item/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.getCartItemByDishId
);
routes.delete(
  '/item/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.deleteCartItemByDishId
);

module.exports = routes;
