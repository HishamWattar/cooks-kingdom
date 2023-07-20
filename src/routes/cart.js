const express = require('express');
const routes = express.Router();
const cartControllers = require('../controllers/cart');

routes.post('/', cartControllers.postCart);
routes.delete('/', cartControllers.deleteCart)  
routes.post('/CartItem/:id', cartControllers.postCartItemByDishId,)
routes.put('CartItem/:id', cartControllers.putCartItemByDishId)
routes.get('CartItem/:id',  cartControllers.getCartItemByDishId)
routes.delete('CartItem/:id',  cartControllers.deleteCartItemByDishId)





