const express = require('express');
const cartControllers = require('../controllers/cart');
const { isAuthenticated, isCustomer } = require('../middlewares/auth');
const {
  updateCartItem,
  validationHandler,
} = require('../middlewares/validation');

const routes = express.Router();

routes.get('/', isAuthenticated, isCustomer, cartControllers.getCart);
routes.post('/', isAuthenticated, isCustomer, cartControllers.postCart);
routes.delete('/', isAuthenticated, isCustomer, cartControllers.deleteCart);
routes.post(
  '/cartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.postCartItemByDishId
);
routes.put(
  '/cartItem/:id',
  updateCartItem,
  validationHandler,
  isAuthenticated,
  isCustomer,
  cartControllers.putCartItemByDishId
);
routes.get(
  '/cartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.getCartItemByDishId
);
routes.delete(
  '/cartItem/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.deleteCartItemByDishId
);

module.exports = routes;
