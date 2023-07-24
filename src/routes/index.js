const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const userRoutes = require('./user');

routes.use('/auth', authRoutes);
routes.use('/admin/user', adminRoutes);
routes.use('/user', userRoutes);

module.exports = routes;
