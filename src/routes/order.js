const express = require('express');

const routes = express.Router();
const { isCustomer } = require('../middlewares/auth');
const { isChef } = require('../middlewares/auth');
const { isAuthenticated } = require('../middlewares/auth');
const orderRoutes = require('../controllers/order');

routes.get(
  '/customer',
  isAuthenticated,
  isCustomer,
  orderRoutes.getAllOrdersForCustomer
);

routes.get('/chef', isAuthenticated, isChef, orderRoutes.getAllOrdersForChef);

routes.post('/', isAuthenticated, isCustomer, orderRoutes.createOrder);

routes.put('/:id', isAuthenticated, isChef, orderRoutes.updateOrder);

routes.delete('/:id', isAuthenticated, isCustomer, orderRoutes.deleteOrder);

module.exports = routes;
