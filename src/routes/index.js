const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

routes.use('/auth', authRoutes);
routes.use('/admin/user', adminRoutes);

module.exports = routes;
