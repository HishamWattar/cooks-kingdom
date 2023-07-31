const express = require('express');

const routes = express.Router();
const orderController = require('../controllers/order');

const { isAuthenticated, isChef, isCustomer } = require('../middlewares/auth');
// customer routes
routes.get(
  '/:customerId',
  isAuthenticated,
  isCustomer,
  orderController.getAllOrders
);
routes.get(
  '/:orderId',
  isAuthenticated,
  isCustomer,
  orderController.getOrderById
);
routes.post('/', isAuthenticated, isCustomer, orderController.createOrder);
routes.post(
  '/orderItems/:orderId',
  isAuthenticated,
  isCustomer,
  orderController.addOrderItem
);
routes.delete(
  '/:customerId',
  isAuthenticated,
  isCustomer,
  orderController.deleteOrder
);
// Chef routes
routes.put('/:orderId', isAuthenticated, isChef, orderController.orderUpdate);

module.exports = routes;
