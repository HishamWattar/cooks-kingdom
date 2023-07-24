const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const cartRoutes = require('./cart');

routes.use('/auth', authRoutes);
routes.use('/cart', cartRoutes);

module.exports = routes;
