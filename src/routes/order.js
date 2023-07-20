
const express = require('express');
const routes = express.Router();
const orderControllers = require('../controllers/order');

routes.post('Order/', orderControllers.postOrder)
routes.get('Order/:id', orderControllers.getOrderById)
routes.delete('Order/:id', orderControllers.deleteOrderById)
routes.get('Orders/', orderControllers.getOrders)

