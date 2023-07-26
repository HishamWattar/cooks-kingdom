const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const cartRoutes = require('./cart');

routes.use('/auth', authRoutes);
routes.use('/cart', cartRoutes);
routes.use('/admin/user', adminRoutes);

module.exports = routes;
