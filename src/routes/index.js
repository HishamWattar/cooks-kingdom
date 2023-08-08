const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const dishRoutes = require('./dish');
const reviewRoutes = require('./review');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const cartRoutes = require('./cart');
const ordersRoutes = require('./order');

routes.use('/auth', authRoutes);
routes.use('/dishes', dishRoutes);
routes.use('/reviews', reviewRoutes);
routes.use('/admin/user', adminRoutes);
routes.use('/user', userRoutes);
routes.use('/cart', cartRoutes);
routes.use('/orders', ordersRoutes);

module.exports = routes;
