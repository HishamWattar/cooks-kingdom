const express = require('express');
const cartControllers = require('../controllers/cart');

const routes = express.Router();

routes.post('/', cartControllers.postCart);
routes.delete('/', cartControllers.deleteCart);
routes.post('/CartItem/:id', cartControllers.postCartItemByDishId);
routes.put('CartItem/:id', cartControllers.putCartItemByDishId);
routes.get('CartItem/:id', cartControllers.getCartItemByDishId);
routes.delete('CartItem/:id', cartControllers.deleteCartItemByDishId);

module.exports = routes;
