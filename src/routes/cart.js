/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for managing the cart
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Create a new cart
 *     tags: [Cart]
 *     responses:
 *       201:
 *         description: Successfully created a new cart
 *       500:
 *         description: Failed to create cart
 */
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
