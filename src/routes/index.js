const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const dishRoutes = require('./dish');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const orderRoutes = require('./order');

routes.use('/auth', authRoutes);
routes.use('/dishes', dishRoutes);
routes.use('/orders', orderRoutes);
routes.use('/admin/user', adminRoutes);
routes.use('/user', userRoutes);

module.exports = routes;
