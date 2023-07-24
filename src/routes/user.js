const express = require('express');

const routes = express.Router();
const userController = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');

routes.get('/me', isAuthenticated, userController.getUserProfile);

module.exports = routes;
