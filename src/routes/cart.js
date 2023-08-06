const express = require('express');
const cartControllers = require('../controllers/cart');
const { isAuthenticated, isCustomer } = require('../middlewares/auth');
const {
  updateCartItem,
  validationHandler,
} = require('../middlewares/validation');

const routes = express.Router();

// Get authenticated user cart
routes.get('/', isAuthenticated, isCustomer, cartControllers.getCart);

// Delete authenticated user cart
routes.delete('/', isAuthenticated, isCustomer, cartControllers.deleteCart);

// Add item to cart
routes.post('/item', isAuthenticated, isCustomer, cartControllers.postCartItem);

// Update item in cart
routes.put(
  '/item/:id',
  updateCartItem,
  validationHandler,
  isAuthenticated,
  isCustomer,
  cartControllers.putCartItemById
);

// Get cart by item id
routes.get(
  '/item/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.getCartItemById
);

// Delete item from cart
routes.delete(
  '/item/:id',
  isAuthenticated,
  isCustomer,
  cartControllers.deleteCartItemById
);

module.exports = routes;
