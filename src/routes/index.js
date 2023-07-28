const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const dishRoutes = require('./dish');
const adminRoutes = require('./admin');
const cartRoutes = require('./cart');

routes.use('/auth', authRoutes);
routes.use('/dishes', dishRoutes);
routes.use('/admin/user', adminRoutes);
routes.use('/cart', cartRoutes);

module.exports = routes;
