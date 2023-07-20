const express = require('express');

const routes = express.Router();
const authRoutes = require('./auth');
const dishRoute = require('./dish');

routes.use('/auth', authRoutes);
routes.use('/dishes', dishRoute);

module.exports = routes;
